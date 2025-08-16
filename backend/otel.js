const { NodeSDK } = require('@opentelemetry/sdk-node')
const { ExpressInstrumentation } = require('@opentelemetry/instrumentation-express')
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http')
const { UndiciInstrumentation } = require('@opentelemetry/instrumentation-undici')
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http')
const { diag, DiagConsoleLogger, DiagLogLevel } = require('@opentelemetry/api')

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ERROR)

const exporter = new OTLPTraceExporter({
  url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT
})

const sdk = new NodeSDK({
  traceExporter: exporter,
  instrumentations: [
    new HttpInstrumentation(),
    new ExpressInstrumentation(),
    new UndiciInstrumentation(),
  ],
})

sdk.start().then(() => {
  console.log('[otel] tracing initialized')
}).catch((e) => console.error('[otel] init failed', e))

process.on('SIGTERM', () => {
  sdk.shutdown().finally(() => process.exit(0))
})


