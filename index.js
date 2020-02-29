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
    const resources = this.serverless.service.resources.Resources;
    const compiledResources = this.serverless.service.provider
      .compiledCloudFormationTemplate.Resources;
    const lambdaArns = this.getResourcesWLambdaAssoc(resources);
    _.forEach(lambdaArns, value => {
      const associations =
        value.Properties.DistributionConfig.CacheBehaviors[0].LambdaFunctionAssociations;
      _.forEach(associations, association => {
        const arn = association.LambdaFunctionARN;
        const versionRef = this.getArnAndVersion(compiledResources, arn);
        if (arn && versionRef) {
          this.serverless.cli.log(
            `LambdaWP: injecting arn+version for ${JSON.stringify(
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
