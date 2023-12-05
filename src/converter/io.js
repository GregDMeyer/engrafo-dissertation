const childProcess = require("child_process");
const fs = require("fs-extra");
const path = require("path");
const uploader = require("s3-recursive-uploader");
const axios = require("axios");
const AWS = require("aws-sdk");
const tmp = require("tmp-promise");
const url = require("url");
const util = require("util");

const exec = util.promisify(childProcess.exec);

function normalizeDirectory(dir) {
  if (dir.slice(-1) == "/") {
    dir = dir.slice(0, -1);
  }
  return path.resolve(path.normalize(dir));
}

module.exports = {
    normalizeDirectory: normalizeDirectory
};
