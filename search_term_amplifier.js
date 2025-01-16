/**
 * Copyright 2025 Google LLC
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
 * @fileoverview This is an Ads Script solution called Search Term Amplifier. It extracts
 * keywords from the search term(query) report and adds the queried keywords to
 * specified campaigns and ad groups.
 *
 * IMPORTANT - Be sure to edit the constants before running this script.
 */

/**
 * Constants and Parameters
 */

/**
 * Name of this script.
 * This will be used in the e-mail notification.
 *
 * @const {string}
 */
const SCRIPT_NAME = 'Search Term Amplifier';

/**
 * Array of campaign names where you want to extract keywords from the search
 * term report. It takes search terms from all the nested ad groups. You can set
 * the value to ['__ALL__'] to specify all campaigns should be queried.
 * If set to an empty array (i.e. []), this variable will be ignored, and the
 * ADGROUPS variable will be used.
 *
 * @const {!Array<string>}
 */
const CAMPAIGNS = ['__ALL__'];

/**
 * Array of ad group names you want to extract keywords from the search term
 * report. If the length of 'CAMPAIGNS' variable is not 0, this variable will be
 * ignored. Also, when ADD_KEYWORDS_TO_DIFFERENT_ADGROUP is false, keywords will
 * be added to these ad groups.
 *
 * @const {!Array<string>}
 */
const ADGROUPS = ['Ad_group_my_test', 'Ad_group_my_test_2'];

/**
 * If you want to add keywords to a different ad group than where the search
 * terms were extracted from, set this true. Keywords will then be added to the
 * ad group specified by ADGROUP_TO_ADD_SEARCH_KEYWORDS.
 *
 * @const {boolean}
 */
const ADD_KEYWORDS_TO_DIFFERENT_ADGROUP = false;

/**
 * If ADD_KEYWORDS_TO_DIFFERENT_ADGROUP is true, keywords will be added to the
 * ad group specified here.
 *
 * @const {string}
 */
const ADGROUP_TO_ADD_SEARCH_KEYWORDS = 'Ad_group_my_test';

/**
 * Array of labels applied to keywords added by this script.
 *
 * @const {!Array<string>}
 */
const today = new Date();
const LABELS = [`AutoAdded_${today.toISOString()}`];

/**
 * If true, added keywords will be enabled. Otherwise, keywords will be paused.
 *
 * Not applicable for negative keywords.
 *
 * @const {boolean}
 */
const ENABLE_KEYWORDS = true;

/**
 * If true, keyword status and/or max CPC will be overwitten when the keyword
 * already exists.
 *
 * Not applicable for negative keywords.
 *
 * @const {boolean}
 */
const OVERWRITE_KEYWORDS = false;

/**
 * Max CPC for keywords added to ad groups. Max CPC is only available for some
 * bid strategies, such as manual CPC.
 *
 * Not applicable for negative keywords.
 *
 * @const {number|boolean}
 */
const ADDED_KEYWORDS_MAX_CPC = false;

/**
 * Match type for keywords added to ad groups. This should be selected from
 * EXACT, PHRASE, BROAD, or ALL.
 *
 * If ALL is used, a keyword will be added for each of the match types.
 *
 * @const {string}
 */
const ADDED_KEYWORDS_MATCH_TYPE = 'BROAD';

/**
 * Set true if you want to add negative keywords, not search keywords.
 *
 * @const {boolean}
 */
const IS_NEGATIVE_KEYWORDS = false;

/**
 * GAQL query to extract search terms (queried keywords). Use the query
 * builder and copy and paste the query.
 *
 * The Google Ads Query Builder is available at
 * https://developers.google.com/google-ads/api/fields/v18/search_term_view_query_builder
 * Also, you can test GAQL output with gaql_test.js, which can also be found in
 * the project repository.
 *
 * @const {string}
 */
const GAQL_QUERY_SEARCH_TERM =
  'SELECT search_term_view.search_term' +
  ' FROM search_term_view' +
  ' WHERE metrics.clicks > 0' +
  ' AND metrics.impressions > 0' +
  ' AND metrics.conversions > 0' +
  ' AND segments.date DURING LAST_30_DAYS' +
  " AND search_term_view.status NOT IN ('ADDED')";

/**
 * List of mailing addresses to send reporting email to.
 *
 * @const {!Array<string>}
 */
const MAIL_RECIPIENTS = [];

/**
 * Set true if you want to add a final URL to keywords. Please implement
 * the buildFinalURL method as well.
 *
 * @const {boolean}
 */
const SET_FINAL_URL = false;

/**
 * This is a sample function to build a final URL string. Please implement this
 * function if you want to set final URL for new keywords.
 *
 * @param {!AdsApp.Keyword} keyword The keyword that is being added to the
 *  account.
 *
 * @return {string} The URL to use as the final URL for the keyword.
 */
function buildFinalURL(keyword) {
  const baseUrl = 'https://example.com';
  const param = `?p=${encodeURIComponent(keyword.getText())}`;
  return baseUrl + param;
}

/**
 * Set true if you want to add a mobile final URL to keywords. Please implement
 * the buildMobileFinalURL method as well.
 *
 * @const {boolean}
 */
const SET_MOBILE_FINAL_URL = false;

/**
 * This is a sample function to build a final URL string. Please implement this
 * function if you want to set a final mobile URL for new keywords.
 *
 * @param {!AdsApp.Keyword} keyword The keyword that is being added to the
 *  account.
 *
 * @return {string} The final mobile URL for the keyword.
 */
function buildMobileFinalURL(keyword) {
  const baseUrl = 'https://example.com';
  const param = `?p=${encodeURIComponent(keyword.getText())}`;
  return baseUrl + param;
}

/**
 * List of words that must not be included in keywords added to ad groups.
 *
 * This can be used to ensure words are not used as keywords while avoiding the
 * use of negative keywords.
 *
 * @const {!Array<string>}
 */
const IGNORE_WORDS = [];

/**
 * Main Function
 */
function main() {
  const errors = [];
  let createdKeywordCount = 0;

  createLabels();

  const adGroupsToExtractSearchTerms = getAdsAppAdGroups(
    CAMPAIGNS,
    ADGROUPS,
    IS_NEGATIVE_KEYWORDS,
  );

  if (ADD_KEYWORDS_TO_DIFFERENT_ADGROUP) {
    const resourceIdsEnclosedWithQuotes = adGroupsToExtractSearchTerms
      .map((adGroup) => {
        const resourceId = getAdGroupResourceId(adGroup);
        return `'${resourceId}'`;
      })
      .join(',');

    const gaqlQuery = `${GAQL_QUERY_SEARCH_TERM}
         AND search_term_view.ad_group IN (${resourceIdsEnclosedWithQuotes})`;
    const keywords = fetchSearchTerms(gaqlQuery);
    if (keywords.length === 0) {
      Logger.log('No search terms found for %s.', adGroupsToExtractSearchTerms);
      return;
    }
    const adGroupsIteratorToAddSearchKeywords = AdsApp.adGroups()
      .withCondition(`Name = '${ADGROUP_TO_ADD_SEARCH_KEYWORDS}'`)
      .get();
    if (
      adGroupsIteratorToAddSearchKeywords.length > 1 ||
      adGroupsIteratorToAddSearchKeywords.totalNumEntities() > 1
    ) {
      logger.log(
        'Invalid Value Error: Found multiple ad groups with %s',
        ADGROUP_TO_ADD_SEARCH_KEYWORDS,
      );
      return;
    }
    const adGroupToAddSearchKeywords =
      adGroupsIteratorToAddSearchKeywords.next();

    if (IS_NEGATIVE_KEYWORDS) {
      const error = addNegativeKeywordsToAdGroup(
        keywords,
        ADDED_KEYWORDS_MATCH_TYPE,
        adGroupToAddSearchKeywords,
      );
      errors.push(...error);
      let reportMessage = `${SCRIPT_NAME} completed.`;
      sendReportingEmail(
        errors.length > 0,
        SCRIPT_NAME,
        MAIL_RECIPIENTS,
        reportMessage,
      );
      return;
    }
    const [count, error] = addNewKeywords(keywords, adGroupToAddSearchKeywords);
    createdKeywordCount += count;
    errors.push(...error);
  } else {
    for (const adGroup of adGroupsToExtractSearchTerms) {
      const resourceId = getAdGroupResourceId(adGroup);

      const gaqlQuery = `${GAQL_QUERY_SEARCH_TERM}
          AND search_term_view.ad_group = '${resourceId}'`;
      const keywords = fetchSearchTerms(gaqlQuery);
      if (keywords.length === 0) {
        Logger.log('No search terms found for %s.', adGroup.getName());
      } else {
        if (IS_NEGATIVE_KEYWORDS) {
          const error = addNegativeKeywordsToAdGroup(
            keywords,
            ADDED_KEYWORDS_MATCH_TYPE,
            adGroup,
          );
          errors.push(...error);
        } else {
          const [count, error] = addNewKeywords(keywords, adGroup);
          createdKeywordCount += count;
          errors.push(...error);
        }
      }
    }
  }

  if (errors.length > 0) {
    const message = `Failed to update some keywords:\n\n ${errors.join('\n')}`;

    Logger.log(message);
    MAIL_RECIPIENTS.length > 0 &&
      sendReportingEmail(false, SCRIPT_NAME, MAIL_RECIPIENTS, message);
  } else {
    const message = `${createdKeywordCount} keywords added to the account\n\n`;
    MAIL_RECIPIENTS.length > 0 &&
      sendReportingEmail(true, SCRIPT_NAME, MAIL_RECIPIENTS, message);
  }
}

/**
 * Creates the labels
 */
function createLabels() {
  for (const label of LABELS) {
    if (hasLabel(label)) continue;
    AdsApp.createLabel(label);
    if (AdsApp.getExecutionInfo().isPreview()) {
      Logger.log(
        '[PREVIEW MODE] Label "%s" is configured but will NOT be added to keywords under preview mode.',
        label,
      );
    }
  }
}

/**
 * Fetches the search terms that will be turned into keywords using the given
 * query.
 *
 * The IGNORE_WORDS constant is also used to filter out keywords the user
 * doesn't want returned.
 *
 * @param {string} query The GAQL query to be used to fetch the search terms.
 *
 * @return {!Array<string>} The search terms found via the query filtered using
 *   the ignored words.
 */
function fetchSearchTerms(query) {
  const searchQueryReport = AdsApp.report(query);
  const searchQueryReportRowIterator = searchQueryReport.rows();
  const keywords = [];
  for (const row of searchQueryReportRowIterator) {
    keywords.push(row['search_term_view.search_term']);
  }

  return keywords.filter((kw) => !IGNORE_WORDS.includes(kw));
}

/**
 * Get an ad group resource ID.
 *
 * @param {!AdsApp.​AdGroup} adGroup
 *
 * @return {string} resourceId
 */
function getAdGroupResourceId(adGroup) {
  const customerId = AdsApp.currentAccount().getCustomerId().replace(/-/g, '');
  const adGroupId = adGroup.getId();
  const resourceId = `customers/${customerId}/adGroups/${adGroupId}`;
  return resourceId;
}

/**
 * Get all campaign names.
 *
 * @return {!Array<string>} names of all the campaigns
 */
function getCampaignNames() {
  const campaignNames = [];
  const campaigns = AdsApp.campaigns();

  for (const c of campaigns) {
    campaignNames.push(c.getName());
  }

  Logger.log('All campaigns found: %s', campaignNames);
  return campaignNames;
}

/**
 * Check if label name exists
 *
 * @param {string} labelName
 *
 * @return {boolean}
 */
function hasLabel(labelName) {
  const labelIterator = AdsApp.labels()
    .withCondition(`Name = "${labelName}"`)
    .get();

  return labelIterator.totalNumEntities() > 0;
}

/**
 * Apply match type syntax to keyword
 *
 * Match type reference:
 * https://support.google.com/google-ads/answer/7478529?hl=en#zippy=%2Cbroad-match%2Cphrase-match%2Cexact-match
 *
 * @param {string} keyword
 * @param {string} matchType - should be selected from EXACT, PHRASE, or BROAD
 *
 * @return {string} Keyword in the format for the given match type.
 */
function applyMatchType(keyword, matchType) {
  switch (matchType.toUpperCase()) {
    case 'EXACT':
      return `[${keyword}]`;
    case 'PHRASE':
      return `"${keyword}"`;
    case 'BROAD':
      return keyword;
    default:
      throw new Error(
        'Invalid match type. Match type should be selected from ' +
          'EXACT, PHRASE, or BROAD',
      );
  }
}

/**
 * Get an array of AdGroupIterators from campaign/ad group names. The arg
 * 'adGroups' will be ignored if the length of the array arg 'campaigns' is not
 * 0. Note that DSA adgroups do not allow adding keywords, but negative keywords
 * are allowed.
 *
 * @param {!Array<string>} campaigns
 * @param {!Array<string>} adGroups
 * @param {boolean} isNegativeKeywords
 *
 * @return {!Array<?AdsApp.AdGroupIterator>} adGroupIterators
 */
function getAdsAppAdGroups(campaigns, adGroups, isNegativeKeywords) {
  if (campaigns.length === 0) {
    let adGroupSelector = AdsApp.adGroups().withCondition(
      `Name IN ["${adGroups.join('","')}"]`,
    );
    if (!isNegativeKeywords) {
      adGroupSelector = adGroupSelector.withCondition(
        'AdGroupType != "SEARCH_DYNAMIC_ADS"',
      );
    }
    const adGroupIterator = adGroupSelector.get();
    Logger.log(
      'The number of ad groups found: %s',
      adGroupIterator.totalNumEntities(),
    );

    return [...adGroupIterator];
  }

  const adGroupIterators = [];
  if (campaigns[0] === '__ALL__') {
    campaigns = getCampaignNames();
  }
  const campaignSelector = AdsApp.campaigns().withCondition(
    `CampaignName IN ["${campaigns.join('","')}"]`,
  );
  const campaignIterator = campaignSelector.get();
  Logger.log(
    'The number of campaigns found: %s',
    campaignIterator.totalNumEntities(),
  );

  for (const campaign of campaignIterator) {
    Logger.log('Campaign found: %s', campaign.getName());

    let adGroupSelector = campaign.adGroups();
    if (!isNegativeKeywords) {
      adGroupSelector = adGroupSelector.withCondition(
        'AdGroupType != "SEARCH_DYNAMIC_ADS"',
      );
    }
    const adGroupIterator = adGroupSelector.get();
    Logger.log(
      'The number of ad groups found: %s',
      adGroupIterator.totalNumEntities(),
    );

    adGroupIterators.push(...adGroupIterator);
  }

  return adGroupIterators;
}

/**
 * Create a keyword
 *
 * @param {!AdsApp.AdGroup} adGroup
 * @param {string} keyword - Match type-applied keyword
 * @param {string} matchType - This should be selected from EXACT, PHRASE,
 * or BROAD
 * @param {number|boolean} maxCpc
 * @param {boolean} overwrite - Set true if you want to overwrite existing
 * keyword status.
 *
 * @return {?AdsApp.KeywordOperation | null} The keywordOperation if an attempt
 *  is made to create the keyword, null if the keyword already existed and
 *  overwrite is false.
 */
function createKeyword(adGroup, keyword, matchType, maxCpc, overwrite) {
  const existingKeyword = findKeyword(adGroup, keyword, matchType);

  // skips existing keywords if overwrite setting is false.
  if (existingKeyword && !overwrite) {
    Logger.log(
      'Existing keyword %s in %s, isEnabled %s, is skipped.',
      existingKeyword.getText(),
      existingKeyword.getAdGroup().getName(),
      existingKeyword.isEnabled(),
    );
    return null;
  }

  const keywordAppliedMatchType = applyMatchType(keyword, matchType);

  let keywordBuilder = adGroup
    .newKeywordBuilder()
    .withText(keywordAppliedMatchType);

  // Set keyword maxCPC
  if (maxCpc) {
    keywordBuilder = keywordBuilder.withCpc(maxCpc);
  }
  const keywordOperation = keywordBuilder.build();

  return keywordOperation;
}

/**
 * Find a existing keyword with match type.
 * @param {!AdsApp.AdGroup} adGroup
 * @param {string} keyword
 * @param {string} matchType - This should be selected from EXACT, PHRASE,
 * or BROAD
 *
 * @return {?AdsApp.Keyword}
 */
function findKeyword(adGroup, keyword, matchType) {
  const keywordSelectorConditionText = `Text = "${keyword}"`;
  const keywordSelectorConditionMatchType = `KeywordMatchType = ${matchType}`;

  const existingKeywordIterator = adGroup
    .keywords()
    .withCondition(keywordSelectorConditionText)
    .withCondition(keywordSelectorConditionMatchType)
    .get();

  if (existingKeywordIterator.totalNumEntities() > 1) {
    const error = `Unexpected error: more than 1 keywords found while looking for keyword: ${keyword} in ad group: ${adGroup} with match type: ${matchType}`;
    throw new Error(error);
  }

  const existingKeyword = existingKeywordIterator.hasNext()
    ? existingKeywordIterator.next()
    : null;
  return existingKeyword;
}

/**
 * Adds the given keywords to the given ad group.
 *
 * If ADDED_KEYWORDS_MATCH_TYPE is 'ALL', three keywords are added per keyword
 * in the given array of keywords, one per match type. Otherwise, only one new
 * keyword is created.
 *
 * @param {!Array<!AdsApp.Keyword>} keywords The keywords to add to the Ad Group.
 * @param {!AdsApp.AdGroup} adGroup The Ad Group to add the new keywords to.
 *
 * @return {!Array<number, !Array<!Error>>} The number of keywords successfully created
 *   and the errors encountered while creating the keywords.
 */
function addNewKeywords(keywords, adGroup) {
  let createdKeywordCount = 0;
  const errors = [];
  let matchTypes;
  if (ADDED_KEYWORDS_MATCH_TYPE === 'ALL') {
    matchTypes = ['EXACT', 'PHRASE', 'BROAD'];
  } else {
    matchTypes = [ADDED_KEYWORDS_MATCH_TYPE];
  }
  for (const matchType of matchTypes) {
    const [error, createdKeywords] = addKeywordsToAdGroup(
      keywords,
      matchType,
      adGroup,
      LABELS,
      ADDED_KEYWORDS_MAX_CPC,
      ENABLE_KEYWORDS,
      SET_FINAL_URL,
      SET_MOBILE_FINAL_URL,
      OVERWRITE_KEYWORDS,
    );
    createdKeywordCount += createdKeywords.length;
    error && errors.push(error);
  }

  return [createdKeywordCount, errors];
}

/**
 * Add keywords to the ad group and apply label to added keywords.
 *
 * @param {string} keywords
 * @param {string} matchType - This should be selected from EXACT, PHRASE,
 * or BROAD
 * @param {!AdsApp.AdGroup} adGroup
 * @param {?Array<string>} labels
 * @param {number|boolean} maxCpc
 * @param {boolean} enable - Set true if you want to enable new keyword
 * @param {boolean} setFinalUrl - Set true if you want to set final URL to new keyword
 * @param {boolean} setMobileFinalUrl - Set true if you want to set mobile final URL to new keyword
 * @param {boolean} overwrite - Set true if you want to overwrite existing
 * keyword status.
 *
 * @return {!Array<!Array<?any>, !Array<?AdsApp.Keyword>>}
 * [errors, createdKeywords] - List of errors and successfully added keywords
 */
function addKeywordsToAdGroup(
  keywords,
  matchType,
  adGroup,
  labels,
  maxCpc,
  enable,
  setFinalUrl,
  setMobileFinalUrl,
  overwrite,
) {
  const errors = [];
  const createdKeywords = [];
  const createdKeywordOperations = [];

  // creates keywords
  for (const keyword of keywords) {
    const createdKeywordOperation = createKeyword(
      adGroup,
      keyword,
      matchType,
      maxCpc,
      overwrite,
    );
    if (createdKeywordOperation === null) {
      continue;
    }
    if (createdKeywordOperation.isSuccessful()) {
      createdKeywordOperations.push(createdKeywordOperation);
    } else {
      const error = [
        createdKeywordOperation.getErrors(),
        adGroup.getName(),
        keyword,
      ];
      errors.push(error);
    }
  }

  // maintains keywords
  for (const keywordOperation of createdKeywordOperations) {
    const createdKeyword = keywordOperation.getResult();
    createdKeywords.push(createdKeyword);

    // Scripts in preview mode will error if label has not been added
    // previously to the account in production.
    if (!AdsApp.getExecutionInfo().isPreview()) {
      labels.map((label) => createdKeyword.applyLabel(label));
    }
    enable ? createdKeyword.enable() : createdKeyword.pause();
    if (setFinalUrl) {
      const finalUrl = buildFinalURL(createdKeyword);
      createdKeyword.urls().setFinalUrl(finalUrl);
    }
    if (setMobileFinalUrl) {
      const mobileFinalUrl = buildMobileFinalURL(createdKeyword);
      createdKeyword.urls().setMobileFinalUrl(mobileFinalUrl);
    }

    Logger.log(
      'New keyword %s, added to %s, isEnabled: %s, finalUrl: [%s]',
      createdKeyword.getText(),
      createdKeyword.getAdGroup().getName(),
      createdKeyword.isEnabled(),
      createdKeyword.urls().getFinalUrl(),
    );
  }

  return [errors, createdKeywords];
}

/**
 * Add negative keywords to the ad group. If keyword applied match type exists
 * in search keywords, it will be removed before being added to negative
 * keywords.
 *
 * @param {!Array<string>} keywords
 * @param {string} matchType - should be selected from EXACT, PHRASE, or BROAD
 * @param {!AdsApp.AdGroup} adGroup
 *
 * @return {!Array<?Array<?string>>} errors
 */
function addNegativeKeywordsToAdGroup(keywords, matchType, adGroup) {
  const errors = [];

  for (const keyword of keywords) {
    const existingKeyword = findKeyword(adGroup, keyword, matchType);

    if (existingKeyword) {
      existingKeyword.remove();
      Logger.log('Keyword removed: %s', existingKeyword.getText());
    }

    const keywordAppliedMatchType = applyMatchType(keyword, matchType);

    try {
      // createNegativeKeyword does not throw Error
      adGroup.createNegativeKeyword(keywordAppliedMatchType);
      Logger.log(
        'Negative keyword added to ad group: %s, %s',
        keywordAppliedMatchType,
        adGroup.getName(),
      );
    } catch (e) {
      const error = [
        JSON.stringify(e),
        adGroup.getName(),
        keywordAppliedMatchType,
      ];
      error && errors.push(error);
    }
  }

  return errors;
}

/**
 * Send email
 *
 * @param {boolean} isSucceeded
 * @param {string} scriptName
 * @param {!Array<string>} recipients - list of mailing addresses for receivers
 * @param {string=} message
 */
function sendReportingEmail(isSucceeded, scriptName, recipients, message) {
  const accountName = AdsApp.currentAccount().getName();
  const customerId = AdsApp.currentAccount().getCustomerId();

  let subject = isSucceeded ? '[SUCCEEDED]' : '[FAILED]';
  subject =
    subject +
    ` Ads scripts: ${scriptName} executed on ${accountName}: ${customerId}`;

  const firstLine =
    'Please go to your account and check script history for ' + 'details\n\n';
  if (message) {
    message = `${firstLine} + ${message}`;
  } else {
    message = firstLine;
  }

  MailApp.sendEmail(recipients.join(','), subject, message);
  Logger.log('Reporting mail sent');
}

// Exports are only needed for unit testing.
exports.LABELS = LABELS;
exports.IGNORE_WORDS = IGNORE_WORDS;
exports.ADDED_KEYWORDS_MATCH_TYPE = ADDED_KEYWORDS_MATCH_TYPE;
exports.hasLabel = hasLabel;
exports.createLabels = createLabels;
exports.findKeyword = findKeyword;
exports.applyMatchType = applyMatchType;
exports.getAdGroupResourceId = getAdGroupResourceId;
exports.getCampaignNames = getCampaignNames;
exports.fetchSearchTerms = fetchSearchTerms;
exports.getAdsAppAdGroups = getAdsAppAdGroups;
exports.addNegativeKeywordsToAdGroup = addNegativeKeywordsToAdGroup;
exports.createKeyword = createKeyword;
exports.addKeywordsToAdGroup = addKeywordsToAdGroup;
