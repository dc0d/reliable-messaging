// Code generated by moq; DO NOT EDIT.
// github.com/matryer/moq

package model

import (
	"sync"
	"time"
)

// Ensure, that TimeSourceMock does implement TimeSource.
// If this is not the case, regenerate this file with moq.
var _ TimeSource = &TimeSourceMock{}

// TimeSourceMock is a mock implementation of TimeSource.
//
// 	func TestSomethingThatUsesTimeSource(t *testing.T) {
//
// 		// make and configure a mocked TimeSource
// 		mockedTimeSource := &TimeSourceMock{
// 			NowUTCFunc: func() time.Time {
// 				panic("mock out the NowUTC method")
// 			},
// 		}
//
// 		// use mockedTimeSource in code that requires TimeSource
// 		// and then make assertions.
//
// 	}
type TimeSourceMock struct {
	// NowUTCFunc mocks the NowUTC method.
	NowUTCFunc func() time.Time

	// calls tracks calls to the methods.
	calls struct {
		// NowUTC holds details about calls to the NowUTC method.
		NowUTC []struct {
		}
	}
	lockNowUTC sync.RWMutex
}

// NowUTC calls NowUTCFunc.
func (mock *TimeSourceMock) NowUTC() time.Time {
	if mock.NowUTCFunc == nil {
		panic("TimeSourceMock.NowUTCFunc: method is nil but TimeSource.NowUTC was just called")
	}
	callInfo := struct {
	}{}
	mock.lockNowUTC.Lock()
	mock.calls.NowUTC = append(mock.calls.NowUTC, callInfo)
	mock.lockNowUTC.Unlock()
	return mock.NowUTCFunc()
}

// NowUTCCalls gets all the calls that were made to NowUTC.
// Check the length with:
//     len(mockedTimeSource.NowUTCCalls())
func (mock *TimeSourceMock) NowUTCCalls() []struct {
} {
	var calls []struct {
	}
	mock.lockNowUTC.RLock()
	calls = mock.calls.NowUTC
	mock.lockNowUTC.RUnlock()
	return calls
}