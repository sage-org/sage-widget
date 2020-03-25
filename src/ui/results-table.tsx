/* file: results-table.tsx
MIT License

Copyright (c) 2019-2020 Thomas Minier

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the 'Software'), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

import React from 'react'
import BindingsRepository from '../sparql/bindings-repo'

import Table from 'react-bootstrap/Table'

interface ResultsTableProps {
  /** Repository where all solutions bindings are pushed */
  repository: BindingsRepository,
  /** DOM update threshold upon insertion of new bindings into the repository */
  updateThreshold: number
}

/**
 * A table to display solution bindings produced by the query execution
 * @author Thomas Minier
 */
export default class ResultsTable extends React.Component<ResultsTableProps> {
  componentDidMount () {
    let counter = 0
    // listen for repo. update and redraw after every THRESHOLD
    this.props.repository.onAdd(() => {
      counter++
      if (counter > this.props.updateThreshold) {
        this.forceUpdate()
        counter = 0
      }
    })
  }

  render () {
    return (
      <Table>
          <tbody>
            {this.props.repository.findAll().map(bindings => {
              return (
                <tr key={bindings.getID()}>
                  {bindings.map((key: string, value: string) => {
                    return (<td key={key}>${key} => {value}</td>)
                  })}
                </tr>
              )
            })}
          </tbody>
        </Table>
    )
  }
}
