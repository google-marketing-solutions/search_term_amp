 Copyright 2025 Google LLC

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.

# Search Term Amplifier

Search Term Amplifier is a Google Ads Script solution that extracts keywords
from the search term(query) report and adds the queried keywords to specified
campaigns and ad groups.

Please direct all questions, comments, and feedback to
[gaukey_qa](mailto:gaukey_qa@google.com)

## Instructions

Please read main script and edit "Constants and Params" section and spreadsheet
before running the script.

To deploy the script:

1.  Copy it into the
    [Google Ads script editor](https://support.google.com/google-ads/answer/188712)

2.  Remove the `exports` block at the bottom of the script.

3.  Edit the script's constants and parameters to reflect your preferences and
    requirements.

4.  Test that the script will preform the correct actions by using the preview
    function of the scripts editor.

5.  *Optional*
    [Schedule the script](https://support.google.com/google-ads/answer/188712?hl=en#:~:text=run%20it%20again.-,Scheduling%20a%20script,-Once%20you%27ve%20created)
    to run on a regular basis automatically.

Running the script will result in keywords being added to the account, if any appropriate search terms are found. If email addresses are added to the configuration, an email will also be sent to the recipients with the results of the execution.

## Configuration

The following constants can be changed to affect how the script executes. They are also documented in the script itself.

SCRIPT_NAME
: The name used to identify the script in logs and the results email.

CAMPAIGNS
: An array of campaign names to extract search terms for. All of the child Ad Groups of the listed campaigns will be included. If all campaigns should be included, you can use `__ALL__` as the only element of the array. If this constant is empty, the `ADGROUPS` constant will be used instead when building the search term report.

ADGROUPS
: Only used if the CAMPAIGNS constant is an empty array. An array of Ad Groups to extract search terms for and to add the resulting keywords too. 

ADD_KEYWORDS_TO_DIFFERENT_ADGROUP
: A boolean flag to specify that keywords should be added to a specific Ad Group, specified by the `ADGROUP_TO_ADD_SEARCH_KEYWORDS` constant.

ADGROUP_TO_ADD_SEARCH_KEYWORDS
: If `ADD_KEYWORDS_TO_DIFFERENT_ADGROUP` is true, new keywords will be added to this Ad Group.

LABELS
: An array of labels to apply to the new keywords.

ENABLE_KEYWORDS
: If true, new keywords will be enabled immediately. Otherwise, the keywords are added in a PAUSED state. This is not applicable to negative keywords (which are always enabled).

OVERWRITE_KEYWORDS
: If true, the keywords status and CPC (if applicable) will be overwritten if the keywords already exists. This is not applicable to negative keywords.

ADDED_KEYWORDS_MAX_CPC
: The maximum CPC to set for added keywords. If this is set to `false`, no CPC will be set. This is not applicable to negative keywords.

IS_NEGATIVE_KEYWORDS
: If this is `true`, new keywords will be added as negative keywords instead of search keywords. We suggest using this sparingly to better allow the Google Ads systems to maximize coverage.

GAQL_QUERY_SEARCH_TERM
: The [GAQL](https://developers.google.com/google-ads/api/docs/query/overview) query to use when creating the search term report. You can use the [GAQL query builder](https://developers.google.com/google-ads/api/fields/v18/search_term_view_query_builder) to create a new query with narrower filters if needed.

MAIL_RECIPIENTS
: An array of email addresses that will receive the results email after the script is executed. No email will be sent if this array is empty.

SET_FINAL_URL
: If `true`, the function specified by `buildFinalUrl` will be used to set the final URL for new keywords.

SET_MOBILE_FINAL_URL
: If `true`, the function specified by `buildMobileFinalUrl` will be used to set the final mobile URL for new keywords.

IGNORE_WORDS
: An array of terms that will be not be used when creating new keywords. This can be used instead of negative keywords to ensure certain words and phrases are not used. Please note that this is a literal list, and only exact matches will be ignored. 


