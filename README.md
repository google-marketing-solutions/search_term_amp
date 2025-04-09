STamp Github README

Configuration
The following constants can be changed to affect how the script executes. They are also documented in the script itself.

**MANDATORY + BASIC Parameters**

SCRIPT_NAME : The name used to identify the script in logs and the results email.

CAMPAIGNS : An array of Campaign names to extract search terms from. All Ad Groups within these campaigns will be processed. To include all campaigns, set value to ['__ALL__'] . If empty, the ADGROUPS constant will be used instead.

ADGROUPS : An array of Ad Group names to extract search terms from. Only used if the CAMPAIGNS constant is an empty array.

ENABLE_KEYWORDS : If true, new keywords will be enabled immediately. Otherwise, the keywords are added in a PAUSED state, which allows for a review prior to enabling.
This is not applicable to negative keywords (which are always enabled).

GAQL_QUERY_SEARCH_TERM : Ths is where you define the criteria for "High Performance." The GAQL query will be used to extract the applicable search terms. Levarage GAQL Query Builder to help you create a query with a different set of filters, if needed.

LABELS : An array of labels to apply to the new keywords (recommended for monitoring & reporting).

MAIL_RECIPIENTS : An array of email addresses that will receive the results email after the script is executed. No email will be sent if this array is empty.


**Additional Parameters (for advanced use-cases)**

IGNORE_WORDS : An array of terms that will be not be created as new keywords. This can replace negative keywords as means to ensure certain words and phrases are not used. Please note that this is a literal list, and only exact matches will be ignored.

ADD_KEYWORDS_TO_DIFFERENT_ADGROUP : A boolean flag to specify whether new keywords should be added to a specific Ad Group, specified by the ADGROUP_TO_ADD_SEARCH_KEYWORDS constant.

ADGROUP_TO_ADD_SEARCH_KEYWORDS : If ADD_KEYWORDS_TO_DIFFERENT_ADGROUP is true, new keywords will be added to the Ad Group specified here.

ADDED_KEYWORDS_MAX_CPC : The maximum CPC to set for added keywords. If this is set to false, no CPC will be set. This is not applicable to negative keywords.

SET_FINAL_URL : If true, the function specified by buildFinalUrl will be used to set the final URL for new keywords.

SET_MOBILE_FINAL_URL : If true, the function specified by buildMobileFinalUrl will be used to set the final mobile URL for new keywords.

OVERWRITE_KEYWORDS : If true, the keywords status and CPC (if applicable) will be overwritten if the keywords already exists. This is not applicable to negative keywords.

IS_NEGATIVE_KEYWORDS : If this is true, new keywords will be added as negative keywords instead of search keywords. We suggest using this sparingly to better allow the Google Ads systems to maximize coverage.

