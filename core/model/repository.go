package model

type ChangeSet struct {
	Incoming     PriceUpdated
	UpdatedStock Stock
	Outgoing     StockUpdated
	OldStockRev  string
}

type Repository interface {
	PriceUpdatedEventExists(eventID string) (bool, error)
	LoadStock(stockID string) (Stock, error)
	Submit(changeSet ChangeSet) error
}
