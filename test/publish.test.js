const sinon = require('sinon');
const test = require('ava');
const proxyquire = require('proxyquire');

const logger = {
  log: sinon.fake()
};

test.beforeEach(t => {
  t.context.stubs = {
    execaStub: sinon.stub()
  };
});

test.afterEach(t => {
  t.context.stubs.execaStub.resetHistory();
});

test('publish', async t => {
  const { execaStub } = t.context.stubs;
  const publisher = 'semantic-release-vsce';
  const name = 'Semantice Release VSCE';
  const publish = proxyquire('../lib/publish', {
    execa: execaStub,
    'fs-extra': {
      readJson: sinon.stub().returns({
        publisher,
        name
      })
    }
  });

  const version = '1.0.0';
  const token = 'abc123';
  sinon.stub(process, 'env').value({
    VSCE_PAT: token
  });
  const result = await publish(version, undefined, logger);

  t.deepEqual(result, {
    name: 'Visual Studio Marketplace',
    url: `https://marketplace.visualstudio.com/items?itemName=${publisher}.${name}`
  });
  t.deepEqual(execaStub.getCall(0).args, ['vsce', ['publish', version, '--no-git-tag-version'], { stdio: 'inherit' }]);
});

test('publish with packagePath', async t => {
  const { execaStub } = t.context.stubs;
  const publisher = 'semantic-release-vsce';
  const name = 'Semantice Release VSCE';
  const publish = proxyquire('../lib/publish', {
    execa: execaStub,
    'fs-extra': {
      readJson: sinon.stub().returns({
        publisher,
        name
      })
    }
  });

  const version = '1.0.0';
  const packagePath = 'test.vsix';
  const token = 'abc123';
  sinon.stub(process, 'env').value({
    VSCE_PAT: token
  });
  const result = await publish(version, packagePath, logger);

  t.deepEqual(result, {
    name: 'Visual Studio Marketplace',
    url: `https://marketplace.visualstudio.com/items?itemName=${publisher}.${name}`
  });
  t.deepEqual(execaStub.getCall(0).args, ['vsce', ['publish', '--packagePath', packagePath], { stdio: 'inherit' }]);
});

test('publish to OpenVSX', async t => {
  const { execaStub } = t.context.stubs;
  const publisher = 'semantic-release-vsce';
  const name = 'Semantice Release VSCE';
  const publish = proxyquire('../lib/publish', {
    execa: execaStub,
    'fs-extra': {
      readJson: sinon.stub().returns({
        publisher,
        name
      })
    }
  });

  const version = '1.0.0';
  const packagePath = 'test.vsix';
  const token = 'abc123';
  sinon.stub(process, 'env').value({
    OVSX_PAT: token,
    VSCE_PAT: token
  });
  const result = await publish(version, packagePath, logger);

  t.deepEqual(result, {
    name: 'Visual Studio Marketplace',
    url: `https://marketplace.visualstudio.com/items?itemName=${publisher}.${name}`
  });
  t.deepEqual(execaStub.getCall(0).args, ['vsce', ['publish', '--packagePath', packagePath], { stdio: 'inherit' }]);

  // t.deepEqual(result[1], {
  //   name: 'Open VSX Registry',
  //   url: `https://open-vsx.org/extension/${publisher}/${name}/${version}`
  // });
  t.deepEqual(execaStub.getCall(1).args, ['ovsx', ['publish', packagePath], { stdio: 'inherit' }]);
});
