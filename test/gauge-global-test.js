/* globals stepRegistry, stepParser */
var assert = require("chai").assert;
var sinon  = require("sinon");
require("../src/gauge-global");

describe("Calling global gauge()", function() {

  before( function(done) {
    sinon.spy(stepRegistry, "add");
    sinon.spy(stepParser, "generalise");
    done();
  });

  beforeEach(function() {
    stepRegistry.clear();
  });

  after( function(done) {
    stepRegistry.add.restore();
    stepParser.generalise.restore();
    done();
  });

  it("should throw error if steptext is empty", function (done) {
    var dumb = function () {};
    assert.throw(function () { gauge(); });
    assert.throw(function () { gauge("", dumb); });
    assert.throw(function () { gauge([], dumb); });
    assert.throw(function () { gauge(["", ""], dumb); });
    done();
  });

  it("should add test function to step registry", function(done) {
    var sampleFunction = function() {};

    gauge("Step <1>", sampleFunction);

    assert(stepRegistry.add.calledOnce);
    assert(stepParser.generalise.calledOnce);
    assert.equal("Step <1>", stepParser.generalise.getCall(0).args[0]);
    assert.equal("Step {}", stepRegistry.add.getCall(0).args[0]);
    assert.equal("Step <1>", stepRegistry.add.getCall(0).args[1]);
    assert.deepEqual(sampleFunction, stepRegistry.add.getCall(0).args[2]);
    done();
  });

  it("should support step aliases", function(done) {
    var sampleFunction = function(stepnum) { console.log(stepnum); };

    gauge(["Step <stepnum>","Another step <stepnum>"], sampleFunction);
    var list = stepRegistry.get();

    assert(list["Step {}"]);
    assert(list["Another step {}"]);

    assert.equal(list["Step {}"].stepText, "Step <stepnum>");
    assert.deepEqual(list["Step {}"].fn, sampleFunction);

    assert.equal(list["Another step {}"].stepText, "Another step <stepnum>");
    assert.deepEqual(list["Another step {}"].fn, sampleFunction);

    done();
  });

});
