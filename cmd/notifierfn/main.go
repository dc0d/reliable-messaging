package main

import (
	"github.com/dc0d/reliable-messaging/logging"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

func main() {
	defer func() { _ = logger.Sync() }()

	lambda.Start(invoke)
}

func invoke(event events.DynamoDBEvent) (interface{}, error) {
	logger.Infow("triggered by", "event", event)

	return nil, nil
}

var (
	logger = logging.CreateLogger().Sugar().Named("notifierfn")
)
