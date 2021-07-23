//go:generate moq -pkg actions_test -out ./service_mock_test.go ./../model EntityDomainService:EntityDomainServiceMock

//nolint
package actions_test

import (
	"testing"

	"github.com/dc0d/reliable-messaging/core/actions"
	"github.com/dc0d/reliable-messaging/core/model"
	"github.com/dc0d/reliable-messaging/test/support"

	"github.com/stretchr/testify/assert"
)

func TestUpdatePrice_Execute(t *testing.T) {
	var (
		incoming model.PriceUpdated
		service  = &EntityDomainServiceMock{}
		action   *actions.UpdatePrice
	)

	Scenario{
		{`given a price updated event`, func(t *testing.T) {
			incoming.ID = ""
			incoming.UpdatedStock.StockID = "STK"
			incoming.UpdatedStock.Price = 1.1

			service.UpdateStockFunc = func(incoming model.PriceUpdated) error {
				return nil
			}

			action = actions.UpdatePriceBuilder{Service: service}.Build()
		}},
		{`when the event is already processed`, func(t *testing.T) {
			_ = action.Execute(incoming)
		}},
		{`it should ignore the event`, func(t *testing.T) {
			assert.Len(t, service.UpdateStockCalls(), 1)
			assert.Equal(t, incoming, service.UpdateStockCalls()[0].Incoming)
		}},
	}.Run(t)
}

type Scenario = support.Scenario
