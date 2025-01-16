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
 * @fileoverview Unit tests for the Search Term Amplifier Ads Script solution.
 */

const sta = require('../search_term_amplifier');

class FakeAdsIterator {
  /**
   * Creates a new FakeAdsIterator, which replicates the API of an AdsApp
   * Iterator.
   *
   * @param {!Array<!any>} data The data that will be iterated over.
   */
  constructor(data) {
    this.data = data;
    this.nextIndex = 0;
  }

  /**
   * Returns the number of elements in the backing array.
   *
   * @return {number} the number of elements in the backing array.
   */
  totalNumEntities() {
    return this.data.length;
  }

  /**
   * Returns whether all of the elements have been iterated over.
   *
   * @return {boolean} true if there are still elements left to iterate over,
   *                   otherwise false.
   */
  hasNext() {
    return this.nextIndex < this.data.length;
  }

  /**
   * Returns the next element in the backing array, or null if all of the
   * elements have already been iterated over.
   *
   * @return {?any} the next element in the backing array.
   */
  next() {
    if (this.nextIndex < this.data.length) {
      return this.data[this.nextIndex++];
    } else {
      return null;
    }
  }

  [Symbol.iterator]() {
    return this.data[Symbol.iterator]();
  }
}

// Log entries are not checked, as they aren't used by the user and are subject
// to improvement.
const fakeLogger = jasmine.createSpyObj('Logger', {log: null});
jasmine.getGlobal().Logger = fakeLogger;

describe('hasLabel', () => {
  beforeEach(() => {
    const adsApp = jasmine.createSpyObj('AdsApp', [
      'labels',
      'withCondition',
      'get',
    ]);
    adsApp.labels.and.returnValue(adsApp);
    adsApp.withCondition.and.returnValue(adsApp);
    jasmine.getGlobal().AdsApp = adsApp;
  });

  afterEach(() => {
    jasmine.getGlobal().AdsApp = null;
  });

  it('returns true when single label is found', () => {
    jasmine
      .getGlobal()
      .AdsApp.get.and.returnValue(new FakeAdsIterator('FAKE_LABEL'));
    expect(sta.hasLabel('NOT IMPRORTANT')).toBeTrue();
  });

  it('returns true when multiple labels are found', () => {
    jasmine
      .getGlobal()
      .AdsApp.get.and.returnValue(new FakeAdsIterator(['one', 'two', 'three']));
    expect(sta.hasLabel('NOT IMPORTANT')).toBeTrue();
  });

  it('returns false if no label is found', () => {
    jasmine.getGlobal().AdsApp.get.and.returnValue(new FakeAdsIterator([]));
    expect(sta.hasLabel('NOT IMPORTANT')).toBeFalse();
  });
});

describe('createLabels', () => {
  beforeEach(() => {
    sta.LABELS.length = 0;
    const adsApp = jasmine.createSpyObj('AdsApp', [
      'labels',
      'withCondition',
      'get',
      'createLabel',
      'getExecutionInfo',
      'isPreview',
    ]);
    adsApp.labels.and.returnValue(adsApp);
    adsApp.withCondition.and.returnValue(adsApp);
    adsApp.createLabel.and.returnValue(true);
    adsApp.getExecutionInfo.and.returnValue(adsApp);
    adsApp.isPreview.and.returnValue(false);
    jasmine.getGlobal().AdsApp = adsApp;
  });

  afterEach(() => {
    jasmine.getGlobal().AdsApp = null;
  });

  it('creates one label when one is defined and none exist', () => {
    sta.LABELS.push('a');
    const adsApp = jasmine.getGlobal().AdsApp;
    adsApp.get.and.returnValue(new FakeAdsIterator([]));
    sta.createLabels();
    expect(adsApp.createLabel).toHaveBeenCalledOnceWith('a');
  });

  it('creates multiple labels when multiple are defined and none exist', () => {
    sta.LABELS.push('a', 'b');
    const adsApp = jasmine.getGlobal().AdsApp;
    adsApp.get.and.returnValue(new FakeAdsIterator([]));
    sta.createLabels();
    expect(adsApp.createLabel).toHaveBeenCalledWith('a');
    expect(adsApp.createLabel).toHaveBeenCalledWith('b');
    expect(adsApp.createLabel).toHaveBeenCalledTimes(2);
  });

  it('does not create labels that already exist', () => {
    sta.LABELS.push('a', 'b');
    const adsApp = jasmine.getGlobal().AdsApp;
    const fakeLabels = [[], ['a']];
    function fakeGet() {
      return new FakeAdsIterator(fakeLabels.pop());
    }
    adsApp.get.and.callFake(fakeGet);
    sta.createLabels();
    expect(adsApp.createLabel).toHaveBeenCalledOnceWith('b');
  });
});

describe('findKeyword', () => {
  let adGroupSpy;
  beforeEach(() => {
    adGroupSpy = jasmine.createSpyObj('AdGroup', [
      'keywords',
      'withCondition',
      'get',
      'toString',
    ]);
    adGroupSpy.keywords.and.returnValue(adGroupSpy);
    adGroupSpy.withCondition.and.returnValue(adGroupSpy);
    adGroupSpy.toString.and.returnValue('Fake AdGroup');
  });

  it('returns a single keyword when one is found', () => {
    const want = 'fake keyword';
    adGroupSpy.get.and.returnValue(new FakeAdsIterator([want]));
    expect(sta.findKeyword(adGroupSpy, want, 'NOT_IMPORTANT')).toBe(want);
  });

  it('returns an error if multiple keywords are found', () => {
    adGroupSpy.get.and.returnValue(new FakeAdsIterator(['a', 'b']));
    expect(function () {
      sta.findKeyword(adGroupSpy, 'NOT_IMPORTANT', 'NOT_IMPORTANT');
    }).toThrow();
  });

  it('returns null is no keyword is found', () => {
    adGroupSpy.get.and.returnValue(new FakeAdsIterator([]));
    expect(
      sta.findKeyword(adGroupSpy, 'NOT_IMPORTANT', 'NOT_IMPORTANT'),
    ).toBeNull();
  });
});

describe('applyMatchType', () => {
  it('returns the correct string for Exact matches', () => {
    const keyword = 'SOME KEYWORD';
    const want = `[${keyword}]`;
    expect(sta.applyMatchType(keyword, 'EXACT')).toBe(want);
  });

  it('returns the correct string for Phrase matches', () => {
    const keyword = 'SOME KEYWORD';
    const want = `"${keyword}"`;
    expect(sta.applyMatchType(keyword, 'PHRASE')).toBe(want);
  });

  it('returns the correct string for Broad matches', () => {
    const keyword = 'SOME KEYWORD';
    expect(sta.applyMatchType(keyword, 'BROAD')).toBe(keyword);
  });

  it('throws when an incorrect type is passed', () => {
    expect(function () {
      sta.applyMatchType('Not Important', 'BAD MATCH');
    }).toThrow();
  });
});

describe('getAdGroupResourceId', () => {
  it('returns a well-formatted resource id', () => {
    const fakeCID = '123-456-789';
    const adsAppSpy = jasmine.createSpyObj('AdsApp', [
      'currentAccount',
      'getCustomerId',
    ]);
    adsAppSpy.currentAccount.and.returnValue(adsAppSpy);
    adsAppSpy.getCustomerId.and.returnValue(fakeCID);
    jasmine.getGlobal().AdsApp = adsAppSpy;
    const fakeAdGroupId = '123456';
    const adGroupSpy = jasmine.createSpyObj('AdGroup', {getId: fakeAdGroupId});
    const want = 'customers/123456789/adGroups/123456';
    expect(sta.getAdGroupResourceId(adGroupSpy)).toBe(want);
  });
});

describe('getCampaignNames', () => {
  it('returns an empty list if no campaigns are found', () => {
    const adsAppSpy = jasmine.createSpyObj('AdsApp', {campaigns: []});
    jasmine.getGlobal().AdsApp = adsAppSpy;
    expect(sta.getCampaignNames()).toHaveSize(0);
  });

  it('returns an array with the right number of items', () => {
    const fakeCampaigns = [
      {
        getName: function () {
          return 'a';
        },
      },
      {
        getName: function () {
          return 'b';
        },
      },
    ];
    const adsAppSpy = jasmine.createSpyObj('AdsApp', {
      campaigns: fakeCampaigns,
    });
    jasmine.getGlobal().AdsApp = adsAppSpy;
    const got = sta.getCampaignNames();
    expect(got).toHaveSize(2);
    expect(got).toContain('a');
    expect(got).toContain('b');
  });
});

class FakeAdsReport {
  /**
   * Creates an instance of a FakeAdsReport, which is used to mock Ads search term reports.
   *
   * @param {!Array<string>} data The search terms to add to the report.
   */
  constructor(data) {
    this.data = [];
    for (const row of data) {
      this.data.push({'search_term_view.search_term': row});
    }
  }

  /**
   * Returns the data for the report.
   *
   * @return {!Array<string>} the report data.
   */
  rows() {
    return this.data;
  }
}

describe('fetchSearchTerms', () => {
  it('returns an empty array when no search terms are found', () => {
    const adsAppSpy = jasmine.createSpyObj('AdsApp', {
      report: new FakeAdsReport([]),
    });
    jasmine.getGlobal().AdsApp = adsAppSpy;
    expect(sta.fetchSearchTerms('NOT IMPORTANT')).toHaveSize(0);
  });

  it('returns the correct array when no ignore words are set', () => {
    const fakeSearchTerms = ['a', 'b'];
    const adsAppSpy = jasmine.createSpyObj('AdsApp', {
      report: new FakeAdsReport(fakeSearchTerms),
    });
    sta.IGNORE_WORDS.length = 0;
    jasmine.getGlobal().AdsApp = adsAppSpy;
    const got = sta.fetchSearchTerms('NOT IMPORTANT');
    expect(got).toEqual(fakeSearchTerms);
  });

  it('returns the correct array when ignore words are set', () => {
    const fakeSearchTerms = ['a', 'b'];
    const adsAppSpy = jasmine.createSpyObj('AdsApp', {
      report: new FakeAdsReport(fakeSearchTerms),
    });
    jasmine.getGlobal().AdsApp = adsAppSpy;
    sta.IGNORE_WORDS.length = 0;
    sta.IGNORE_WORDS.push('a');
    const got = sta.fetchSearchTerms('NOT IMPRORTANT');
    expect(got).toHaveSize(1);
    expect(got).toEqual(['b']);
  });
});

describe('getAdsAppAdGroups', () => {
  beforeEach(() => {
    const adsAppSpy = jasmine.createSpyObj('AdsApp', [
      'adGroups',
      'withCondition',
      'campaigns',
      'get',
    ]);
    adsAppSpy.adGroups.and.returnValue(adsAppSpy);
    adsAppSpy.withCondition.and.returnValue(adsAppSpy);
    jasmine.getGlobal().AdsApp = adsAppSpy;
  });

  it('returns an empty array if nothing is found and nothing is specified', () => {
    const adsAppSpy = jasmine.getGlobal().AdsApp;
    adsAppSpy.get.and.returnValue(new FakeAdsIterator([]));
    expect(sta.getAdsAppAdGroups([], [], false)).toHaveSize(0);
    expect(adsAppSpy.withCondition).toHaveBeenCalledTimes(2);
    expect(sta.getAdsAppAdGroups([], [], true)).toHaveSize(0);
    expect(adsAppSpy.withCondition).toHaveBeenCalledTimes(3);
  });

  it('returns an empty array if ad group names are defined, but none found', () => {
    const adsAppSpy = jasmine.getGlobal().AdsApp;
    adsAppSpy.get.and.returnValue(new FakeAdsIterator([]));
    expect(
      sta.getAdsAppAdGroups([], ['not', 'important'], false),
    ).toHaveSize(0);
    expect(sta.getAdsAppAdGroups([], ['not', 'important'], true)).toHaveSize(
      0,
    );
  });

  it('returns the correct array if ad group names are defined', () => {
    const want = ['a', 'b'];
    const adsAppSpy = jasmine.getGlobal().AdsApp;
    adsAppSpy.get.and.returnValue(new FakeAdsIterator(want));
    expect(sta.getAdsAppAdGroups([], ['not', 'important'], false)).toEqual(
      want,
    );
    expect(sta.getAdsAppAdGroups([], ['not', 'important'], true)).toEqual(
      want,
    );
  });

  it('returns an empty array if campaigns are specified, but no groups are found', () => {
    const adsAppSpy = jasmine.getGlobal().AdsApp;
    adsAppSpy.campaigns.and.returnValue(adsAppSpy);
    adsAppSpy.get.and.returnValue(new FakeAdsIterator([]));
    expect(
      sta.getAdsAppAdGroups(['not', 'important'], [], false),
    ).toHaveSize(0);
    expect(sta.getAdsAppAdGroups(['not', 'important'], [], true)).toHaveSize(
      0,
    );
    expect(adsAppSpy.campaigns).toHaveBeenCalledTimes(2);
  });

  it('returns the correct array if campaigns are specified', () => {
    const fakeCampaign1 = jasmine.createSpyObj('Campaign', [
      'getName',
      'adGroups',
      'withCondition',
      'get',
    ]);
    fakeCampaign1.getName.and.returnValue('a');
    fakeCampaign1.adGroups.and.returnValue(fakeCampaign1);
    fakeCampaign1.withCondition.and.returnValue(fakeCampaign1);
    fakeCampaign1.get.and.returnValue(
      new FakeAdsIterator(['group1', 'group2']),
    );
    const fakeCampaign2 = jasmine.createSpyObj('Campaign', [
      'getName',
      'adGroups',
      'withCondition',
      'get',
    ]);
    fakeCampaign2.getName.and.returnValue('b');
    fakeCampaign2.adGroups.and.returnValue(fakeCampaign2);
    fakeCampaign2.withCondition.and.returnValue(fakeCampaign2);
    fakeCampaign2.get.and.returnValue(
      new FakeAdsIterator(['group3', 'group4']),
    );
    const adsAppSpy = jasmine.createSpyObj('AdsApp', [
      'campaigns',
      'withCondition',
      'get',
    ]);
    adsAppSpy.campaigns.and.returnValue(adsAppSpy);
    adsAppSpy.withCondition.and.returnValue(adsAppSpy);
    adsAppSpy.get.and.returnValue(
      new FakeAdsIterator([fakeCampaign1, fakeCampaign2]),
    );
    jasmine.getGlobal().AdsApp = adsAppSpy;

    expect(sta.getAdsAppAdGroups(['not', 'important'], [], false)).toEqual([
      'group1',
      'group2',
      'group3',
      'group4',
    ]);
    expect(fakeCampaign1.withCondition).toHaveBeenCalledTimes(1);
    expect(fakeCampaign2.withCondition).toHaveBeenCalledTimes(1);
    expect(sta.getAdsAppAdGroups(['not', 'important'], [], true)).toEqual([
      'group1',
      'group2',
      'group3',
      'group4',
    ]);
    expect(fakeCampaign1.withCondition).toHaveBeenCalledTimes(1);
    expect(fakeCampaign2.withCondition).toHaveBeenCalledTimes(1);
  });

  it('returns the correct arry when called with __ALL__ campaigns', () => {
    const fakeCampaign1 = jasmine.createSpyObj('Campaign', [
      'getName',
      'adGroups',
      'withCondition',
      'get',
    ]);
    fakeCampaign1.getName.and.returnValue('a');
    fakeCampaign1.adGroups.and.returnValue(fakeCampaign1);
    fakeCampaign1.withCondition.and.returnValue(fakeCampaign1);
    fakeCampaign1.get.and.returnValue(
      new FakeAdsIterator(['group1', 'group2']),
    );
    const fakeCampaign2 = jasmine.createSpyObj('Campaign', [
      'getName',
      'adGroups',
      'withCondition',
      'get',
    ]);
    fakeCampaign2.getName.and.returnValue('b');
    fakeCampaign2.adGroups.and.returnValue(fakeCampaign2);
    fakeCampaign2.withCondition.and.returnValue(fakeCampaign2);
    fakeCampaign2.get.and.returnValue(
      new FakeAdsIterator(['group3', 'group4']),
    );
    const adsAppSpy = jasmine.createSpyObj('AdsApp', [
      'campaigns',
      'withCondition',
      'get',
    ]);
    const fakeCampaignIterator = new FakeAdsIterator([
      fakeCampaign1,
      fakeCampaign2,
    ]);
    adsAppSpy.campaigns.and.returnValues(
      fakeCampaignIterator,
      adsAppSpy,
      fakeCampaignIterator,
      adsAppSpy,
    );
    adsAppSpy.withCondition.and.returnValue(adsAppSpy);
    adsAppSpy.get.and.returnValue(fakeCampaignIterator);
    jasmine.getGlobal().AdsApp = adsAppSpy;

    expect(sta.getAdsAppAdGroups(['__ALL__'], [], false)).toEqual([
      'group1',
      'group2',
      'group3',
      'group4',
    ]);
    expect(fakeCampaign1.withCondition).toHaveBeenCalledTimes(1);
    expect(fakeCampaign2.withCondition).toHaveBeenCalledTimes(1);
    expect(sta.getAdsAppAdGroups(['__ALL__'], [], true)).toEqual([
      'group1',
      'group2',
      'group3',
      'group4',
    ]);
    expect(fakeCampaign1.withCondition).toHaveBeenCalledTimes(1);
    expect(fakeCampaign2.withCondition).toHaveBeenCalledTimes(1);
  });
});

describe('addNegativeKeywordsToAdGroup', () => {
  let adGroupSpy;

  beforeEach(() => {
    adGroupSpy = jasmine.createSpyObj('AdGroup', [
      'keywords',
      'withCondition',
      'get',
      'remove',
      'createNegativeKeyword',
      'getName',
    ]);
    adGroupSpy.keywords.and.returnValue(adGroupSpy);
    adGroupSpy.withCondition.and.returnValue(adGroupSpy);
    adGroupSpy.getName.and.returnValue('not important');
  });

  const testAddNegativeKeywords = (
    keywords,
    existingKeywords,
    expectedCreateCalls,
    expectedReturnSize,
  ) => {
    adGroupSpy.createNegativeKeyword.calls.reset();
    adGroupSpy.get.and.returnValue(new FakeAdsIterator(existingKeywords));

    expect(
      sta.addNegativeKeywordsToAdGroup(keywords, 'BROAD', adGroupSpy)[0],
    ).toHaveSize(expectedReturnSize);
    expect(adGroupSpy.createNegativeKeyword).toHaveBeenCalledTimes(
      expectedCreateCalls,
    );
    for (const keyword of keywords) {
      expect(adGroupSpy.createNegativeKeyword).toHaveBeenCalledWith(keyword);
    }
  };

  it('does nothing if no keywords are provided', () => {
    testAddNegativeKeywords([], [], 0, 0);
  });

  it('adds negative keywords when the provided keywords do not exist', () => {
    testAddNegativeKeywords(['fake keyword'], [], 1, 1);
    testAddNegativeKeywords(['first keyword', 'second keyword'], [], 2, 2);
  });

  it('removes old keywords before creating new negative ones', () => {
    const fakeKeywordSpy = jasmine.createSpyObj('Keyword', [
      'getText',
      'remove',
    ]);
    fakeKeywordSpy.getText.and.returnValue('not important');
    adGroupSpy.get.and.returnValues(
      new FakeAdsIterator([fakeKeywordSpy]),
      new FakeAdsIterator([fakeKeywordSpy]),
      new FakeAdsIterator([]),
    );
    fakeKeywordSpy.remove.calls.reset();

    testAddNegativeKeywords(['fake keyword'], [fakeKeywordSpy], 1, 1);
    expect(fakeKeywordSpy.remove).toHaveBeenCalledTimes(1);
    fakeKeywordSpy.remove.calls.reset();

    testAddNegativeKeywords(
      ['first keyword', 'second keyword'],
      [fakeKeywordSpy],
      2,
      2,
    );
  });
});

describe('createKeyword', () => {
  let fakeKeyword;
  let fakeKeywordBuilder;
  let adGroupSpy;

  beforeEach(() => {
    fakeKeyword = jasmine.createSpyObj('Keyword', [
      'getText',
      'getAdGroup',
      'getName',
      'isEnabled',
    ]);
    fakeKeyword.getText.and.returnValue('fake keyword');
    fakeKeyword.getAdGroup.and.returnValue(fakeKeyword);
    fakeKeyword.getName.and.returnValue('not important');
    fakeKeyword.isEnabled.and.returnValue(true);
    fakeKeywordBuilder = jasmine.createSpyObj('KeywordBuilder', [
      'withText',
      'withCpc',
      'build',
    ]);
    fakeKeywordBuilder.withText.and.returnValue(fakeKeywordBuilder);
    fakeKeywordBuilder.withCpc.and.returnValue(fakeKeywordBuilder);
    fakeKeywordBuilder.build.and.returnValue('pass');
    adGroupSpy = jasmine.createSpyObj('AdGroup', [
      'keywords',
      'withCondition',
      'get',
      'newKeywordBuilder',
    ]);
    adGroupSpy.keywords.and.returnValue(adGroupSpy);
    adGroupSpy.withCondition.and.returnValue(adGroupSpy);
    adGroupSpy.newKeywordBuilder.and.returnValue(fakeKeywordBuilder);
  });

  const testCreateKeyword = (
    keywordExists,
    maxCpc,
    overwrite,
    expectedResult,
    expectedWithTextCalls,
    expectedWithCpcCalls,
  ) => {
    adGroupSpy.get.and.returnValue(
      new FakeAdsIterator(keywordExists ? [fakeKeyword] : []),
    );

    expect(
      sta.createKeyword(
        adGroupSpy,
        'fake keyword',
        'BROAD',
        maxCpc,
        overwrite,
      ),
    ).toEqual(expectedResult);
    expect(fakeKeywordBuilder.withText).toHaveBeenCalledTimes(
      expectedWithTextCalls,
    );
    expect(fakeKeywordBuilder.withCpc).toHaveBeenCalledTimes(
      expectedWithCpcCalls,
    );
  };

  it('skips adding the keyword if it exists and overwrite is false', () => {
    testCreateKeyword(true, false, false, null, 0, 0);
  });

  it('adds a keyword if it does not already exist', () => {
    testCreateKeyword(false, false, false, 'pass', 1, 0);
  });

  it('adds a keyword if it exists and overwrite is true', () => {
    testCreateKeyword(true, false, true, 'pass', 1, 0);
  });

  it('sets the CPC if a number is provided', () => {
    testCreateKeyword(false, 5, false, 'pass', 1, 1);
    expect(fakeKeywordBuilder.withCpc).toHaveBeenCalledOnceWith(5);
  });
});

describe('addKeywordsToAdGroup', () => {
  let adGroupSpy;
  let keywordBuilderSpy;
  let keywordSpy;
  let keywordOperationSpy;

  beforeEach(() => {
    const adsAppSpy = jasmine.createSpyObj('AdsApp', [
      'getExecutionInfo',
      'isPreview',
    ]);
    adsAppSpy.getExecutionInfo.and.returnValue(adsAppSpy);
    adsAppSpy.isPreview.and.returnValue(false);
    jasmine.getGlobal().AdsApp = adsAppSpy;

    jasmine.getGlobal().buildFinalURL = () => {
      return 'fake_url';
    };
    jasmine.getGlobal().buildMobileFinalURL = () => {
      return 'fake_mobile_url';
    };

    adGroupSpy = jasmine.createSpyObj('AdGroup', [
      'getName',
      'newKeywordBuilder',
      'createNegativeKeyword',
      'keywords',
      'withCondition',
      'get',
    ]);
    keywordBuilderSpy = jasmine.createSpyObj('KeywordBuilder', [
      'withText',
      'withCpc',
      'build',
    ]);
    keywordSpy = jasmine.createSpyObj('Keyword', [
      'applyLabel',
      'enable',
      'pause',
      'urls',
      'getText',
      'getAdGroup',
      'isEnabled',
      'setFinalUrl',
      'setMobileFinalUrl',
      'getFinalUrl',
    ]);
    keywordOperationSpy = jasmine.createSpyObj('KeywordOperation', [
      'isSuccessful',
      'getResult',
      'getErrors',
    ]);

    adGroupSpy.getName.and.returnValue('ad group name');
    adGroupSpy.keywords.and.returnValue(adGroupSpy);
    adGroupSpy.withCondition.and.returnValue(adGroupSpy);
    adGroupSpy.get.and.returnValue(new FakeAdsIterator([]));
    adGroupSpy.newKeywordBuilder.and.returnValue(keywordBuilderSpy);
    keywordBuilderSpy.withText.and.returnValue(keywordBuilderSpy);
    keywordBuilderSpy.withCpc.and.returnValue(keywordBuilderSpy);
    keywordBuilderSpy.build.and.returnValue(keywordOperationSpy);
    keywordSpy.applyLabel.calls.reset();
    keywordSpy.getAdGroup.and.returnValue(adGroupSpy);
    keywordSpy.urls.and.returnValue(keywordSpy);
    keywordOperationSpy.isSuccessful.and.returnValue(true);
    keywordOperationSpy.getResult.and.returnValue(keywordSpy);
  });

  const testAddKeywordsToAdGroup = (
    keywords,
    matchType,
    labels,
    maxCpc,
    enable,
    setFinalUrl,
    setFinalMobileUrl,
    successful,
  ) => {
    keywordOperationSpy.isSuccessful.and.returnValue(successful);
    const got = sta.addKeywordsToAdGroup(
      keywords,
      matchType,
      adGroupSpy,
      labels,
      maxCpc,
      enable,
      setFinalUrl,
      setFinalMobileUrl,
      true,
    );
    if (maxCpc) {
      expect(keywordBuilderSpy.withCpc).toHaveBeenCalledWith(maxCpc);
    }

    if (successful) {
      if (enable) {
        expect(keywordSpy.enable).toHaveBeenCalledTimes(keywords.length);
      } else {
        expect(keywordSpy.pause).toHaveBeenCalledTimes(keywords.length);
      }
      expect(keywordSpy.applyLabel).toHaveBeenCalledTimes(
        keywords.length * labels.length,
      );
    }

    expect(keywordBuilderSpy.build).toHaveBeenCalledTimes(keywords.length);

    return got;
  };

  it('should add keywords to the ad group when keywords do not exist', () => {
    const keywords = ['keyword1', 'keyword2'];
    const matchType = 'BROAD';
    const labels = ['label1', 'label2'];
    const maxCpc = 1.0;
    const enable = true;
    const setFinalUrl = false;
    const setMobileFinalUrl = false;
    const successful = true;

    const [gotErrors, gotKeywords] = testAddKeywordsToAdGroup(
      keywords,
      matchType,
      labels,
      maxCpc,
      enable,
      setFinalUrl,
      setMobileFinalUrl,
      successful,
    );

    expect(keywordBuilderSpy.withText).toHaveBeenCalledWith('keyword1');
    expect(keywordBuilderSpy.withText).toHaveBeenCalledWith('keyword2');
    expect(keywordSpy.applyLabel).toHaveBeenCalledWith('label1');
    expect(keywordSpy.applyLabel).toHaveBeenCalledWith('label2');
    expect(gotErrors).toHaveSize(0);
    expect(gotKeywords).toHaveSize(keywords.length);
  });

  it('should not add keywords if the operations fail', () => {
    const keywords = ['keyword1', 'keyword2'];
    const matchType = 'BROAD';
    const labels = ['label1', 'label2'];
    const maxCpc = 1.0;
    const enable = true;
    const setFinalUrl = false;
    const setMobileFinalUrl = false;
    const successful = false;

    const [gotErrors, gotKeywords] = testAddKeywordsToAdGroup(
      keywords,
      matchType,
      labels,
      maxCpc,
      enable,
      setFinalUrl,
      setMobileFinalUrl,
      successful,
    );

    expect(keywordBuilderSpy.withText).toHaveBeenCalledWith('keyword1');
    expect(keywordBuilderSpy.withText).toHaveBeenCalledWith('keyword2');
    expect(keywordSpy.applyLabel).toHaveBeenCalledTimes(0);
    expect(gotErrors).toHaveSize(keywords.length);
    expect(gotKeywords).toHaveSize(0);
  });

  it('should set the final URL when setFinalURL is true', () => {
    const keywords = ['keyword1', 'keyword2'];
    const matchType = 'BROAD';
    const labels = ['label1', 'label2'];
    const maxCpc = 1.0;
    const enable = true;
    const setFinalUrl = true;
    const setMobileFinalUrl = false;
    const successful = true;
    keywordSpy.getText.and.returnValues(
      'keyword1',
      'keyword1',
      'keyword2',
      'keyword2',
    ); // urls and logging

    testAddKeywordsToAdGroup(
      keywords,
      matchType,
      labels,
      maxCpc,
      enable,
      setFinalUrl,
      setMobileFinalUrl,
      successful,
    );
    const urlArgs = keywordSpy.setFinalUrl.calls.allArgs();
    expect(urlArgs).toHaveSize(keywords.length);
    for (let i = 0; i < urlArgs.length; i++) {
      expect(urlArgs[i]).toMatch(keywords[i]);
    }
  });

  it('should set the final mobile URL when setMobileFinalURL is true', () => {
    const keywords = ['keyword1', 'keyword2'];
    const matchType = 'BROAD';
    const labels = ['label1', 'label2'];
    const maxCpc = 1.0;
    const enable = true;
    const setFinalUrl = false;
    const setMobileFinalUrl = true;
    const successful = true;
    keywordSpy.getText.and.returnValues(
      'keyword1',
      'keyword1',
      'keyword2',
      'keyword2',
    ); // urls and logging

    testAddKeywordsToAdGroup(
      keywords,
      matchType,
      labels,
      maxCpc,
      enable,
      setFinalUrl,
      setMobileFinalUrl,
      successful,
    );
    const urlArgs = keywordSpy.setMobileFinalUrl.calls.allArgs();
    expect(urlArgs).toHaveSize(keywords.length);
    for (let i = 0; i < urlArgs.length; i++) {
      expect(urlArgs[i]).toMatch(keywords[i]);
    }
  });
});

describe('sendReportingEmail', () => {
  const fakeAccountName = 'Test Account';
  const fakeCustomerId = '1234567890';
  let mailAppSpy;

  beforeEach(() => {
    const adsAppSpy = jasmine.createSpyObj('AdsApp', ['currentAccount', 'getName', 'getCustomerId']);
    adsAppSpy.currentAccount.and.returnValue(adsAppSpy);
    adsAppSpy.getName.and.returnValue(fakeAccountName);
    adsAppSpy.getCustomerId.and.returnValue(fakeCustomerId);
    jasmine.getGlobal().AdsApp = adsAppSpy;

    mailAppSpy = jasmine.createSpyObj('MailApp', ['sendEmail']);
    jasmine.getGlobal().MailApp = mailAppSpy;
  });

  it('sends the no keywords email if no keywords are added and there are no errors', () => {
    sta.sendReportingEmail('test script', ['a@example.com'], [], []);
    expect(mailAppSpy.sendEmail).toHaveBeenCalledTimes(1);
    const callArgs = mailAppSpy.sendEmail.calls.first().args[0];
    expect(callArgs.subject).toContain('[SUCCEEDED]');
    expect(callArgs.htmlBody).toContain('No keywords were added to the account');
  });

  it('sends a success email with no errors', () => {
    const scriptName = 'Test Script';
    const recipients = ['test@example.com'];
    const keywordList = [
      jasmine.createSpyObj('Keyword', [
        'getCampaign',
        'getAdGroup',
        'getText',
        'getMatchType',
      ]),
    ];
    const errors = [];

    const mockCampaign = jasmine.createSpyObj('Campaign', ['getName', 'getId']);
    mockCampaign.getName.and.returnValue('Test Campaign');
    mockCampaign.getId.and.returnValue('1111111111');
    keywordList[0].getCampaign.and.returnValue(mockCampaign);

    const mockAdGroup = jasmine.createSpyObj('AdGroup', ['getName', 'getId']);
    mockAdGroup.getName.and.returnValue('Test Ad Group');
    mockAdGroup.getId.and.returnValue('2222222222');
    keywordList[0].getAdGroup.and.returnValue(mockAdGroup);

    keywordList[0].getText.and.returnValue('test keyword');
    keywordList[0].getMatchType.and.returnValue('BROAD');

    sta.sendReportingEmail(scriptName, recipients, keywordList, errors);

    expect(mailAppSpy.sendEmail).toHaveBeenCalledTimes(1);
    const callArgs = mailAppSpy.sendEmail.calls.first().args[0];
    expect(callArgs.subject).toEqual('[SUCCEEDED] Ads scripts: Test Script executed on Test Account: 1234567890');
    expect(callArgs.htmlBody).toContain('Keywords added to the account');
    expect(callArgs.htmlBody).not.toContain('The following errors occurred');
  });

  it('sends a success email with errors', () => {
    const scriptName = 'Test Script';
    const recipients = ['test@example.com'];
    const keywordList = [
      jasmine.createSpyObj('Keyword', [
        'getCampaign',
        'getAdGroup',
        'getText',
        'getMatchType',
      ]),
    ];
    const errors = ['Error 1', 'Error 2'];

    const mockCampaign = jasmine.createSpyObj('Campaign', ['getName', 'getId']);
    mockCampaign.getName.and.returnValue('Test Campaign');
    mockCampaign.getId.and.returnValue('1111111111');
    keywordList[0].getCampaign.and.returnValue(mockCampaign);

    const mockAdGroup = jasmine.createSpyObj('AdGroup', ['getName', 'getId']);
    mockAdGroup.getName.and.returnValue('Test Ad Group');
    mockAdGroup.getId.and.returnValue('2222222222');
    keywordList[0].getAdGroup.and.returnValue(mockAdGroup);

    keywordList[0].getText.and.returnValue('test keyword');
    keywordList[0].getMatchType.and.returnValue('BROAD');

    sta.sendReportingEmail(scriptName, recipients, keywordList, errors);

    expect(mailAppSpy.sendEmail).toHaveBeenCalledTimes(1);
    const callArgs = mailAppSpy.sendEmail.calls.first().args[0];
    expect(callArgs.subject).toEqual('[SUCCEEDED with errors] Ads scripts: Test Script executed on Test Account: 1234567890');
    expect(callArgs.htmlBody).toContain('Keywords added to the account');
    expect(callArgs.htmlBody).toContain('The following errors occurred');
  });

  it('sends a failure email with no keywords', () => {
    const scriptName = 'Test Script';
    const recipients = ['test@example.com'];
    const keywordList = [];
    const errors = ['Error 1', 'Error 2'];

    sta.sendReportingEmail(scriptName, recipients, keywordList, errors);

    expect(mailAppSpy.sendEmail).toHaveBeenCalledTimes(1);
    const callArgs = mailAppSpy.sendEmail.calls.first().args[0];
    expect(callArgs.subject).toEqual('[FAILED] Ads scripts: Test Script executed on Test Account: 1234567890');
    expect(callArgs.htmlBody).toContain('No keywords were added to the account');
    expect(callArgs.htmlBody).toContain('The following errors occurred');
  });
});

