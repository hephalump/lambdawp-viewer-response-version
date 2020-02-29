'use strict';

const _ = require('lodash');

class LambdaArn {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;
    this.hooks = {
      'before:package:finalize': this.updateLambdaVersion.bind(this)
    };
  }

  updateLambdaVersion() {
    console.log("STEP 1: ", "STARTED");
    const resources = this.serverless.service.resources.Resources;
      console.log("STEP 2: ", resources);
    const compiledResources = this.serverless.service.provider
      .compiledCloudFormationTemplate.Resources;
      console.log("STEP 3: ", compiledResources);
    const lambdaArns = this.getResourcesWLambdaAssoc(resources);
      console.log("STEP 4: ", lambdaArns);
    _.forEach(lambdaArns, value => {
      const associations =
        value.Properties.DistributionConfig.CacheBehaviors[0].LambdaFunctionAssociations;
        console.log("STEP 5: ", associations);
      _.forEach(associations, association => {
        const arn = association.LambdaFunctionARN;
          console.log("STEP 6: ", arn);
        const versionRef = this.getArnAndVersion(compiledResources, arn);
          console.log("STEP 7: ", versionRef);
        if (arn && versionRef) {
          this.serverless.cli.log(
            `serverless-lambda-version: injecting arn+version for ${JSON.stringify(
              arn
            )}`
          );
          association.LambdaFunctionARN = versionRef;
        }
      });
    });
  }

  getArnAndVersion(resources, funcNormName) {
    const key = _.findKey(resources, {
      Type: 'AWS::Lambda::Version',
      Properties: {
        FunctionName: {
          Ref: funcNormName
        }
      }
    });
    console.log(key);
    return key
      ? {
        'Fn::Join': [
          '',
          [
            { 'Fn::GetAtt': [ funcNormName, 'Arn' ] },
            ':',
            { 'Fn::GetAtt': [ key, 'Version' ] }
          ]
        ]
      }
      : undefined;
  }

  getResourcesWLambdaAssoc(resources) {
    return _.pickBy(resources, {
      Type: 'AWS::CloudFront::Distribution',
      Properties: {
        DistributionConfig: {
          CacheBehaviors: [{
            LambdaFunctionAssociations: [
              {
                EventType: 'viewer-request'
              }
            ]
          }]
        }
      }
    });
  }
}

module.exports = LambdaArn;
