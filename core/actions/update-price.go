package actions

import "github.com/dc0d/reliable-messaging/core/model"

type UpdatePriceBuilder struct {
	Service model.EntityDomainService
}

func (builder UpdatePriceBuilder) Build() *UpdatePrice {
	result := &UpdatePrice{service: builder.Service}

	return result
}

type UpdatePrice struct {
	service model.EntityDomainService
}

func (action *UpdatePrice) Execute(incoming model.PriceUpdated) error {
	return action.service.UpdateStock(incoming)
}
