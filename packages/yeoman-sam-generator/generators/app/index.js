

const Generator = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');
const fs = require('fs');

module.exports = class extends Generator {
  prompting() {
    // Have Yeoman greet the user.
    this.log(
      yosay(`
      Welcome to ${chalk.red('aws-sam-builder created by Tenovos Corporation')}
      `),
    );

    const prompts = [
      {
        type: 'input',
        name: 'name',
        message: 'Please enter the name for the project?',
        default: 'sam-project',
      },
      {
        type: 'input',
        name: 'description',
        message: 'Please enter the description for the project?',
        default: 'sam-project',
      },
      {
        type: 'input',
        name: 'SAM_description',
        message: 'Please enter the description for the SAM template?',
        default: 'sam-project',
      },
      {
        type: 'checkbox',
        name: 'resources',
        message: 'Select the resources which you would like to include in your SAM?',
        choices: [
          'Lambda_with_API_Gateway',
          'DynamoDB',
          'S3',
          'SQS',
          'SNS',
          'IAM',
          'StepFunction (Will gets deployed with Lambda and IAM by default)',
        ],
        default: ['Lambda_with_API_Gateway'],
      },
    ];

    return this.prompt(prompts).then((props) => {
      this.props = props;
    });
  }

  writing() {
    const finalarray = [];

    let IAM;
    let Lambda;
    let SQS;
    let SNS;
    let DynamoDB;
    let StepFunction;
    let S3;
    const writeTemplate = async () => {
      const readfile = new Promise((resolve) => {
        const a = [
          'Lambda_with_API_Gateway',
          'DynamoDB',
          'S3',
          'SQS',
          'SNS',
          'IAM',
          'StepFunction (Will gets deployed with Lambda and IAM by default)',
        ];
        const b = this.props.resources;

        const b1 = new Set(b);
        const difference = [...new Set([...a].filter(x => !b1.has(x)))];

        if (difference.length > 0) {
          for (const each of difference) {
            if (each === 'Lambda_with_API_Gateway') {
              Lambda = null;
            }
            if (each === 'DynamoDB') {
              DynamoDB = null;
            }
            if (
              each === 'StepFunction (Will gets deployed with Lambda and IAM by default)'
            ) {
              StepFunction = null;
            }
            if (each === 'S3') {
              S3 = null;
            }
            if (each === 'SQS') {
              SQS = null;
            }
            if (each === 'SNS') {
              SNS = null;
            }
            if (each === 'IAM') {
              IAM = null;
            }
          }
        }
        for (const every of b) {
          if (every === 'Lambda_with_API_Gateway') {
            fs.readFile(this.templatePath('lambda.yml'), 'utf8', (err, lambdadata) => {
              if (err) {
                console.log(err);
              } else {
                Lambda = lambdadata;

                finalarray.push(Lambda);
              }
            });
          }
          if (every === 'DynamoDB') {
            fs.readFile(
              this.templatePath('dynamodb.yml'),
              'utf8',
              (err, dynamodbdata) => {
                if (err) {
                  console.log(err);
                } else {
                  DynamoDB = dynamodbdata;

                  finalarray.push(DynamoDB);
                }
              },
            );
          }
          if (
            every === 'StepFunction (Will gets deployed with Lambda and IAM by default)'
          ) {
            fs.readFile(
              this.templatePath('stepfunction.yml'),
              (err, stepfunctiondata) => {
                if (err) {
                  console.log(err);
                } else {
                  Lambda = null;
                  IAM = null;
                  StepFunction = stepfunctiondata;

                  finalarray.push(StepFunction);
                }
              },
            );
          }
          if (every === 'S3') {
            fs.readFile(this.templatePath('s3.yml'), 'utf8', (err, s3data) => {
              if (err) {
                console.log(err);
              } else {
                S3 = s3data;

                finalarray.push(S3);
              }
            });
          }
          if (every === 'SQS') {
            fs.readFile(this.templatePath('sqs.yml'), 'utf8', (err, sqsdata) => {
              if (err) {
                console.log(err);
              } else {
                SQS = sqsdata;

                finalarray.push(SQS);
              }
            });
          }
          if (every === 'SNS') {
            fs.readFile(this.templatePath('sns.yml'), 'utf8', (err, snsdata) => {
              if (err) {
                console.log(err);
              } else {
                SNS = snsdata;

                finalarray.push(SNS);
              }
            });
          }
          if (every === 'IAM') {
            fs.readFile(this.templatePath('iam.yml'), 'utf8', (err, iamdata) => {
              if (err) {
                console.log(err);
              } else {
                IAM = iamdata;

                finalarray.push(IAM);
              }
            });
          }
          if (every) {
            if (finalarray.length === 0) {
              setTimeout(() => {
                const body = 'SAM template is being generated based on your selected preference';
                resolve(body);
              }, 1000);
            }
          }
        }
      });
      const finalizefile = body => new Promise((resolve) => {
        console.log(body);
        const final = {
          SAMdescription: this.props.SAM_description,
          IAM,
          Lambda,
          DynamoDB,
          StepFunction,
          SQS,
          SNS,
          S3,
        };
        resolve(final);
      });
      const finalRead = await readfile;
      const finalizingRead = await finalizefile(finalRead);
      return finalizingRead;
    };

    writeTemplate().then((t) => {
      this.fs.copyTpl(
        this.templatePath('_template.yml'),
        this.destinationPath('template.yml'),
        t,
      );
    });
    this.fs.copy(
      this.templatePath('_jest.config.js'),
      this.destinationPath('jest.config.js'),
    );
    this.fs.copy(
      this.templatePath('_buildspec.yml'),
      this.destinationPath('buildspec.yml'),
    );
    this.fs.copy(
      this.templatePath('_tests/_example.test.js'),
      this.destinationPath('tests/example.test.js'),
    );
    this.fs.copy(
      this.templatePath('_src/_index.js'),
      this.destinationPath('src/index.js'),
    );
    this.fs.copyTpl(
      this.templatePath('_package.json'),
      this.destinationPath('package.json'),
      { name: this.props.name, description: this.props.description },
    );
    this.fs.copyTpl(this.templatePath('_README.md'), this.destinationPath('README.md'), {
      name: this.props.name,
      description: this.props.description,
    });
  }
};
