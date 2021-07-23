package model

import (
	"github.com/dc0d/wrapperr"
)

type EntityDomainService interface {
	UpdateStock(incoming PriceUpdated) error
}

type EntityDSBuilder struct {
	Repository Repository
	SeqGen     SeqGen
	TimeSource TimeSource
}

func (builder EntityDSBuilder) Build() *EntityDS {
	return &EntityDS{
		repo:    builder.Repository,
		seqGen:  builder.SeqGen,
		timeSrc: builder.TimeSource,
	}
}

type EntityDS struct {
	repo    Repository
	seqGen  SeqGen
	timeSrc TimeSource
}

func (ds *EntityDS) UpdateStock(incoming PriceUpdated) error {
	updated, err := ds.repo.PriceUpdatedEventExists(incoming.ID)
	if err != nil {
		return wrapperr.WithStack(err)
	}
	if updated {
		return ErrPriceAlreadyUpdated
	}

	oldStock, err := ds.repo.LoadStock(incoming.UpdatedStock.StockID)
	if err != nil {
		if err != ErrNotFound {
			return wrapperr.WithStack(err)
		}
		oldStock = Stock{
			ID:    incoming.UpdatedStock.StockID,
			Price: incoming.UpdatedStock.Price,
			Date:  ds.timeSrc.NowUTC(),
		}
	}

	var updatedStock Stock
	updatedStock.ID = incoming.UpdatedStock.StockID
	updatedStock.Rev = ds.seqGen.Next()
	updatedStock.Price = incoming.UpdatedStock.Price
	updatedStock.Date = ds.timeSrc.NowUTC()

	change := ChangeSet{
		Incoming:     incoming,
		UpdatedStock: updatedStock,
		Outgoing: StockUpdated{
			ID:        ds.seqGen.Next(),
			Timestamp: ds.seqGen.Next(),
			Stock:     updatedStock,
		},
		OldStockRev: oldStock.Rev,
	}

	return ds.repo.Submit(change)
}

const (
	ErrPriceAlreadyUpdated SentinelError = "stock price already updated"
)
