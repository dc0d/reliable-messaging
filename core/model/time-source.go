package model

import "time"

type TimeSource interface {
	NowUTC() time.Time
}

type UTCNow struct{}

func (UTCNow) NowUTC() time.Time { return time.Now().UTC() }
