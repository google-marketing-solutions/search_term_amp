/**
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

/**
 * Copyright Google LLC. Supported by Google LLC and/or its affiliate(s).
 * This solution, including any related sample code or data, is made
 * available on an “as is,” “as available,” and “with all faults” basis,
 * solely for illustrative purposes, and without warranty or representation
 * of any kind. This solution is experimental, unsupported and provided
 * solely for your convenience. Your use of it is subject to your agreements
 * with Google, as applicable, and may constitute a beta feature as defined
 * under those agreements.  To the extent that you make any data available
 * to Google in connection with your use of the solution, you represent and
 * warrant that you have all necessary and appropriate rights, consents and
 * permissions to permit Google to use and process that data.  By using any
 * portion of this solution, you acknowledge, assume and accept all risks,
 * known and unknown, associated with Google’s usage and process that data
 * and your usage, including with respect to your deployment of any portion
 * of this solution in your systems, or usage in connection with your
 * business, if at all. With respect to the entrustment of personal
 * information to Google, you will confirm the established system by checking
 * Google's privacy policy and other public information, and agree that no
 * further information will be provided by Google.
 */

/**
 * @fileoverview This is an ads script to test GAQL query.
 *
 * Edit constants before running this script.
 */


/**
 * Constants and Params
 */

/**
 * GAQL query to extract search terms (queried keywords). Use query
 * builder below and copy and paste the query. Google Ads Query Builder
 * is available at
 * https://developers.google.cn/google-ads/api/fields/v7/search_term_view_query_builder
 *
 * metrics.cost_micros takes 1/1,000,000 of a currency unit, so you should
 * specify 100,000,000 when the cost is 100.
 *
 * e.g.
 * SELECT search_term_view.search_term FROM search_term_view WHERE metrics.conversions = 0 AND metrics.cost_micros >= 3000000000 AND segments.date DURING LAST_7_DAYS
 * SELECT search_term_view.search_term FROM search_term_view WHERE metrics.conversions > 0 AND segments.date DURING LAST_30_DAYS
 * @type {string} GAQL_SEARCH_TERM
 */
var GAQL_QUERY_SEARCH_TERM =
 'SELECT search_term_view.search_term FROM search_term_view WHERE metrics.conversions = 0 AND metrics.cost_micros >= 3000000000 AND segments.date DURING LAST_7_DAYS';


/**
 * Main Function
 */
function main() {
  var searchQueryReport = AdsApp.report(GAQL_QUERY_SEARCH_TERM);
  var searchQueryReportRowIterator = searchQueryReport.rows();

  while (searchQueryReportRowIterator.hasNext()) {
    var row = searchQueryReportRowIterator.next();
    Logger.log(row);
  }
}
