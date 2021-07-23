package model

// PriceUpdated is incoming event
type PriceUpdated struct {
	ID           string
	UpdatedStock struct {
		StockID string
		Price   float64
	}
}

// StockUpdated is outgoing event
type StockUpdated struct {
	ID        string
	Timestamp string
	Stock     Stock
}
