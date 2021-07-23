//go:generate moq -out ./repository_mock_test.go ./ Repository:RepositoryMock
//go:generate moq -out ./seq-gen_mock_test.go ./ SeqGen:SeqGenMock
//go:generate moq -out ./time-source_mock_test.go ./ TimeSource:TimeSourceMock

//nolint
package model

import (
	"testing"
	"time"

	. "github.com/dc0d/reliable-messaging/test/support"

	"github.com/rs/xid"
	"github.com/stretchr/testify/assert"
)

var _ EntityDomainService = &EntityDS{}

func TestEntityDS_UpdateStock_already_updated(t *testing.T) {
	var (
		incoming PriceUpdated
		seqGen   = &SeqGenMock{}
		repo     = &RepositoryMock{}
		ds       *EntityDS

		actualError error
	)

	Scenario{
		{`given an incoming event`, func(t *testing.T) {
			incoming.ID = "1"
			incoming.UpdatedStock.StockID = "STK"
			incoming.UpdatedStock.Price = 1.1

			repo.PriceUpdatedEventExistsFunc = func(eventID string) (bool, error) {
				return true, nil
			}

			ds = EntityDSBuilder{
				SeqGen:     seqGen,
				Repository: repo,
			}.Build()
		}},
		{`when the event is already processed`, func(t *testing.T) {
			actualError = ds.UpdateStock(incoming)
		}},
		{`it should return an error`, func(t *testing.T) {
			assert.Equal(t, ErrPriceAlreadyUpdated, actualError)
			assert.Equal(t, 1, len(repo.PriceUpdatedEventExistsCalls()))
		}},
	}.Run(t)
}

func TestEntityDS_UpdateStock_not_existing_stock(t *testing.T) {
	var (
		incoming        PriceUpdated
		actualChangeSet ChangeSet
		timeUTC         = time.Date(2021, 1, 1, 1, 19, 0, 0, time.UTC)

		utcNow = &TimeSourceMock{}
		seqGen = &SeqGenMock{}
		repo   = &RepositoryMock{}
		ds     *EntityDS
	)

	Scenario{
		{`given an incoming event`, func(t *testing.T) {
			incoming.ID = "1"
			incoming.UpdatedStock.StockID = "STK"
			incoming.UpdatedStock.Price = 1.1

			utcNow.NowUTCFunc = func() time.Time { return timeUTC }

			seqGen.NextFunc = func() (next string) {
				return xid.New().String()
			}

			repo.PriceUpdatedEventExistsFunc = func(eventID string) (bool, error) {
				return false, nil
			}
			repo.LoadStockFunc = func(stockID string) (result Stock, errResult error) {
				errResult = ErrNotFound
				return
			}
			repo.SubmitFunc = func(changeSet ChangeSet) error {
				actualChangeSet = changeSet
				return nil
			}

			ds = EntityDSBuilder{
				Repository: repo,
				SeqGen:     seqGen,
				TimeSource: utcNow,
			}.Build()
		}},
		{`when the stock does not exists`, func(t *testing.T) {
			_ = ds.UpdateStock(incoming)
		}},
		{`it should create the stock`, func(t *testing.T) {
			assert.Equal(t, incoming.UpdatedStock.StockID, actualChangeSet.UpdatedStock.ID)
		}},
	}.Run(t)
}
