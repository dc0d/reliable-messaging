package infrastructure

import (
	"context"
	"encoding/json"
	"os"

	"github.com/dc0d/reliable-messaging/core/model"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/expression"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	"github.com/dc0d/wrapperr"
	"go.uber.org/zap"
)

type Repository struct {
	ctx    context.Context
	client *dynamodb.Client
}

func InitRepository(ctx context.Context) (*Repository, error) {
	result := &Repository{ctx: ctx}

	cfg, err := config.LoadDefaultConfig(result.ctx)
	if err != nil {
		return nil, wrapperr.WithStack(err)
	}

	cfg.Region = os.Getenv("OPS_AWS_REGION")

	result.client = dynamodb.NewFromConfig(cfg)

	return result, nil
}

func (repo *Repository) PriceUpdatedEventExists(eventID string) (bool, error) {
	ctx := repo.ctx
	client := repo.client

	table1 := tableIncomingEvents
	txgetitem1 := types.TransactGetItem{
		Get: &types.Get{
			TableName: &table1,
			Key: map[string]types.AttributeValue{
				"ID": &types.AttributeValueMemberS{
					Value: eventID,
				},
			},
		},
	}

	var input dynamodb.TransactGetItemsInput
	input.TransactItems = append(input.TransactItems, txgetitem1)

	output, err := client.TransactGetItems(ctx, &input)
	if err != nil {
		return false, wrapperr.WithStack(err)
	}

	var (
		prevIncoming model.PriceUpdated
	)

	if len(output.Responses) > 0 && output.Responses[0].Item != nil {
		if err := attributevalue.UnmarshalMap(output.Responses[0].Item, &prevIncoming); err != nil {
			return false, wrapperr.WithStack(err)
		}
	}

	if prevIncoming.ID == eventID {
		return true, nil
	}

	return false, nil
}

func (repo *Repository) LoadStock(stockID string) (result model.Stock, errResult error) {
	ctx := repo.ctx
	client := repo.client
	var (
		prevStock model.Stock
	)

	table := tableStocks
	txgetitem := types.TransactGetItem{
		Get: &types.Get{
			TableName: &table,
			Key: map[string]types.AttributeValue{
				"ID": &types.AttributeValueMemberS{
					Value: stockID,
				},
			},
		},
	}

	input := dynamodb.TransactGetItemsInput{}
	input.TransactItems = append(input.TransactItems, txgetitem)

	output, err := client.TransactGetItems(ctx, &input)
	if err != nil {
		errResult = wrapperr.WithStack(err)
		return
	}

	if len(output.Responses) > 0 && output.Responses[0].Item != nil {
		if err := attributevalue.UnmarshalMap(output.Responses[0].Item, &prevStock); err != nil {
			errResult = wrapperr.WithStack(err)
			return
		}

		result = prevStock
		return
	}

	errResult = model.ErrNotFound
	return
}

func (repo *Repository) Submit(changeSet model.ChangeSet) error {
	ctx := repo.ctx
	client := repo.client

	i1, err := txitem(changeSet.Incoming, tableIncomingEvents)
	if err != nil {
		return wrapperr.WithStack(err)
	}

	var i2 *types.TransactWriteItem
	if changeSet.OldStockRev != "" {
		op := expression.Name("Rev").Equal(expression.Value(changeSet.OldStockRev))
		expr, err := expression.NewBuilder().WithCondition(op).Build()

		if err != nil {
			return wrapperr.WithStack(err)
		}

		i2, err = txitem2(changeSet.UpdatedStock, tableStocks, expr)
		if err != nil {
			return wrapperr.WithStack(err)
		}
	} else {
		i2, err = txitem(changeSet.UpdatedStock, tableStocks)
		if err != nil {
			return wrapperr.WithStack(err)
		}
	}

	i3, err := txitem(changeSet.Outgoing, tableOutgoingEvents)
	if err != nil {
		return wrapperr.WithStack(err)
	}

	var txin dynamodb.TransactWriteItemsInput
	txin.TransactItems = []types.TransactWriteItem{*i1, *i2, *i3}

	txout, err := client.TransactWriteItems(ctx, &txin)
	if err != nil {
		return wrapperr.WithStack(err)
	}

	Logger.Infow(`transaction dynamodb result`, `result`, txout)

	return nil
}

func txitem(v interface{}, tableName string) (result *types.TransactWriteItem, err error) {
	var (
		mv map[string]types.AttributeValue
	)

	v = tomap(v)

	mv, err = attributevalue.MarshalMap(v)
	if err != nil {
		return nil, wrapperr.WithStack(err)
	}

	var put types.Put
	put.Item = mv
	put.TableName = &tableName

	result = &types.TransactWriteItem{}
	result.Put = &put

	return
}

func txitem2(v interface{}, tableName string, expr expression.Expression) (result *types.TransactWriteItem, err error) {
	var (
		mv map[string]types.AttributeValue
	)

	v = tomap(v)

	mv, err = attributevalue.MarshalMap(v)
	if err != nil {
		return nil, wrapperr.WithStack(err)
	}

	put := types.Put{
		ExpressionAttributeNames:  expr.Names(),
		ExpressionAttributeValues: expr.Values(),
		ConditionExpression:       expr.Condition(),
	}
	put.Item = mv
	put.TableName = &tableName

	result = &types.TransactWriteItem{}
	result.Put = &put

	return
}

func tomap(v interface{}) (result map[string]interface{}) {
	js, err := json.Marshal(v)
	if err != nil {
		panic(err)
	}

	result = make(map[string]interface{})
	err = json.Unmarshal(js, &result)
	if err != nil {
		panic(err)
	}

	return
}

var (
	tableIncomingEvents = os.Getenv("OPS_INCOMING_EVENTS")
	tableStocks         = os.Getenv("OPS_ENTITIES_TABLE")
	tableOutgoingEvents = os.Getenv("OPS_OUTGOING_EVENTS")
)

var (
	Logger *zap.SugaredLogger
)
