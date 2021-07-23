package model

import "github.com/rs/xid"

type SeqGen interface {
	Next() string
}

type IDGen struct{}

func (IDGen) Next() string { return xid.New().String() }
