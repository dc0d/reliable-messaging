package support

import (
	"fmt"
	"testing"
)

type Step struct {
	Desc string
	Test func(t *testing.T)
}

type Scenario []Step

func (s Scenario) Run(t *testing.T) {
	for _, step := range s {
		if testing.Verbose() {
			fmt.Printf("\t%v\n", step.Desc)
		}
		if step.Test == nil {
			continue
		}
		step.Test(t)
	}
	fmt.Println()
}
