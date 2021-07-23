package logging

import (
	"fmt"
	"os"
	"path"
	"time"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

func CreateLogger() *zap.Logger {
	zcnf := zap.NewProductionEncoderConfig()
	zcnf.EncodeTime = zapcore.ISO8601TimeEncoder // UTC here if needed
	zcnf.CallerKey = "logged_at"
	zcnf.EncodeLevel = func(level zapcore.Level, encoder zapcore.PrimitiveArrayEncoder) {
		encoder.AppendInt(int(level) * 10)
	}
	zcnf.EncodeCaller = func(caller zapcore.EntryCaller, encoder zapcore.PrimitiveArrayEncoder) {
		if !caller.Defined {
			return
		}
		str := fmt.Sprintf("%v:%v %v", shortFilePath(caller.File), caller.Line, caller.Function)
		encoder.AppendString(str)
	}

	jsonEncoder := zapcore.NewJSONEncoder(zcnf)

	core := zapcore.NewTee(
		zapcore.NewCore(
			jsonEncoder,
			zapcore.Lock(os.Stdout),
			zap.LevelEnablerFunc(
				func(_ zapcore.Level) bool {
					return true
				})))

	return zap.New(core, zap.AddCaller())
}

func Stopwatch(startedAt time.Time, elapsed func(time.Duration)) {
	elapsed(time.Since(startedAt))
}

func shortFilePath(fp string) string {
	return path.Join(path.Base(path.Dir(fp)), path.Base(fp))
}
