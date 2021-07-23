package model

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestIDGen_Next(t *testing.T) {
	var (
		gen SeqGen = IDGen{}
	)

	id1 := gen.Next()
	id2 := gen.Next()

	assert.True(t, id1 < id2)
}
