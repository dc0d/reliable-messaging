package model

import "time"

type Stock struct {
	ID    string
	Rev   string // used for optimistic concurrency
	Price float64
	Date  time.Time
}
