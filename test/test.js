function test (description, assertion, expect) {
  process.stdout.write(description);
  if (assertion === expect) {
    process.stdout.write(' \033[32mOK\033[0m\n');
  } else {
    process.stdout.write(' \033[31mFAIL\033[0m\n');
    process.stderr.write('assertion (' + assertion + ') is not equal to expectation (' + expect + ')\n');
    process.exit(1);
  }
}

test.succeed = function (description) {
  test(description, true, true);
}

test.failed = function (description) {
  test(description, true, false);
}

module.exports = test;
