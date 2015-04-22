/**
 * Created by jaboko on 22.04.15.
 */

/// <reference path='../build/lib/definitions/processor.d.ts' />

import { ProcessorBuilder, Processor, AccessorType } from '../lib/processor';
import { onGet, onSet } from '../examples/accessors';
import { double } from '../examples/double';
import { multi } from '../examples/multi';

describe('processor', () => {

    describe('create processor.Processor', () => {

        var p: Processor;

        before(()=> {
            p = new Processor();
        });

        it('should created', () => {
            expect(p).to.exist;
        });
    });

    describe('processor.ProcessorBuilder', () => {

        var p: ProcessorBuilder;

        before(()=> {
            p = new ProcessorBuilder("test");
        });

        it('should created', () => {
            expect(p).to.exist;
        });

        it('should build', () => {
            p.build();
        });
    });

    describe('onGet accessor decorator', () => {

        var testClass:TestOnGetClass;

        before(()=> {
            testClass = new TestOnGetClass();
        });

        it('check double testA', () => {
            testClass.testA = 4;
            expect(testClass.testA).to.be.eq(8);
            expect(testClass._testA).to.be.eq(4);

            testClass.testA = 10;
            expect(testClass.testA).to.be.eq(20);
            expect(testClass._testA).to.be.eq(10);
        });

        it('check double testB', () => {
            testClass.testB = 4;
            expect(testClass.testB).to.be.eq(8);
            expect(testClass._testB).to.be.eq(4);
            testClass.testB = 10;
            expect(testClass._testB).to.be.eq(10);
            expect(testClass.testB).to.be.eq(20);
        });

        it('check multi testC', () => {
            testClass.testC = 4;
            expect(testClass.testC).to.be.eq(16);
            expect(testClass._testC).to.be.eq(4);
        });

        it('check multi testD', () => {
            testClass.multiFactor = 3;
            testClass.testD = 10;
            expect(testClass.testD).to.be.eq(30);
            expect(testClass._testD).to.be.eq(10);
        });

        it('check multi testE', () => {
            testClass.multiFactor = 3;
            testClass.testE = 10;
            expect(testClass.testE).to.be.eq(30);
            expect(testClass._testE).to.be.eq(10);
        });

    });

    describe('onSet accessor decorator', () => {

        var testClass:TestOnSetClass;

        before(()=> {
            testClass = new TestOnSetClass();
        });

        it('check double testA', () => {
            testClass.testA = 4;
            expect(testClass.testA).to.be.eq(8);
            expect(testClass._testA).to.be.eq(8);

            testClass.testA = 10;
            expect(testClass.testA).to.be.eq(20);
            expect(testClass._testA).to.be.eq(20);
        });

        it('check double testB', () => {
            testClass.testB = 4;
            expect(testClass.testB).to.be.eq(8);
            expect(testClass._testB).to.be.eq(8);
            testClass.testB = 10;
            expect(testClass.testB).to.be.eq(20);
            expect(testClass._testB).to.be.eq(20);
        });

    });

});

class TestOnGetClass {

    public _testA;
    public _testB;
    public _testC;
    public _testD;
    public _testE;

    @onGet(double)
    get testA(): number {
        return this._testA;
    }
    set testA(value:number) {
        this._testA = value;
    }

    @onGet(double())
    get testB(): number {
        return this._testB;
    }
    set testB(value:number) {
        this._testB = value;
    }

    @onGet(multi(4))
    get testC(): number {
        return this._testC;
    }
    set testC(value:number) {
        this._testC = value;
    }

    public multiFactor:number;

    @onGet(multi('this.multiFactor'))
    get testD(): number {
        return this._testD;
    }
    set testD(value:number) {
        this._testD = value;
    }

    @multi('this.multiFactor', AccessorType.GET)
    get testE(): number {
        return this._testE;
    }
    set testE(value:number) {
        this._testE = value;
    }
}

class TestOnSetClass {

    public _testA;
    public _testB;

    @onSet(double)
    get testA(): number {
        return this._testA;
    }
    set testA(value:number) {
        this._testA = value;
    }

    @onSet(double())
    get testB(): number {
        return this._testB;
    }
    set testB(value:number) {
        this._testB = value;
    }
}