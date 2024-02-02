import { createWriteStream } from 'fs'
import ApiError from './ApiError'

type ApiLoggerReasons = 'error' | 'log' | 'debug' | 'warn'

export default class ApiLogger {
  private static stdout = process.stdout
  private static output = createWriteStream(process.env.OUTPUT_FILE ?? 'output.log', { flags: 'w' })

  private static timestampOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3
  }

  private static get timestamp () {
    return new Date().toLocaleString('ru', this.timestampOptions)
  }

  private static reasonMap = {
    'error': '🔺',
    'log': '📜',
    'debug': '🐞',
    'warn': '⚠️'
  }

  private static out (reason: ApiLoggerReasons, ...outputs: Array<unknown>) {
    const results = [`${ this.reasonMap[reason] } [${ this.timestamp }]`]

    for (const output of outputs) {
      if (output instanceof Error) {
        console.error(output)
      }
      results.push(output instanceof Error && !(output instanceof ApiError) ? output.message : JSON.stringify(output, void 0, 2))
    }

    if (results.length === 1) {
      results.push('Unknown')
    }

    const result = results.join(results.length === 2 && results[1].length < 80 ? ' ' : '\n') + '\n'

    this.stdout.write(result)
    this.output.write(result)
  }

  public static log (...outputs: Array<unknown>) {
    this.out('log', ...outputs)
  }

  public static error (...outputs: Array<unknown>) {
    this.out('error', ...outputs)
  }

  public static warn (...outputs: Array<unknown>) {
    this.out('warn', ...outputs)
  }

  public static debug (...outputs: Array<unknown>) {
    this.out('debug', ...outputs)
  }
}