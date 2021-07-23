package main

import (
	"context"
	"encoding/json"
	"errors"

	"github.com/dc0d/reliable-messaging/core/actions"
	"github.com/dc0d/reliable-messaging/core/infrastructure"
	"github.com/dc0d/reliable-messaging/core/model"
	"github.com/dc0d/reliable-messaging/logging"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/dc0d/wrapperr"
)

func main() {
	defer func() { _ = logger.Sync() }()
	infrastructure.Logger = logger

	lambda.Start(invoke)
}

func invoke(event events.SQSEvent) (interface{}, error) {
	logger.Infow("triggered by", "event", event)

	if len(event.Records) == 0 {
		return nil, wrapperr.WithStack(errors.New("no messages"))
	}

	for _, msg := range event.Records {
		evt, err := toIncoming(msg)
		if err != nil {
			return nil, wrapperr.WithStack(err) // temp, should delete the successfull ones - in parallel
		}

		repo, err := infrastructure.InitRepository(context.Background())
		if err != nil {
			return nil, wrapperr.WithStack(err)
		}

		var seqGen model.IDGen
		var timeSource model.UTCNow

		ds := model.EntityDSBuilder{
			Repository: repo,
			SeqGen:     &seqGen,
			TimeSource: &timeSource,
		}.Build()

		action := actions.UpdatePriceBuilder{Service: ds}.Build()

		if err := action.Execute(evt); err != nil {
			return nil, wrapperr.WithStack(err)
		}
	}

	return nil, nil
}

func toIncoming(msg events.SQSMessage) (incoming model.PriceUpdated, err error) {
	err = json.Unmarshal([]byte(msg.Body), &incoming)
	return
}

var (
	logger = logging.CreateLogger().Sugar().Named("logicfn")
)
