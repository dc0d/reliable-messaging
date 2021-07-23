package model

type SentinelError string

func (err SentinelError) Error() string { return string(err) }
