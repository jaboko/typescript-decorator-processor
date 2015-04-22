/**
 * Created by jaboko on 01.04.15.
 */

export enum ProcessorType
{
    PROPERTY_DESCRIPTION_PROCESSOR = 1 << 0,
    VALUE_PROCESSOR = 1 << 1,
    AFTER_CALL_PROCESSOR = 1 << 2,
}

export enum ProcessType
{
    METHOD_APPLY = 1 << 0,
    METHOD_PARAMETER = 1 << 1,
    ACCESSOR = 1 << 2,
}

export enum AccessorType
{
    GET = 1 << 10,
    SET = 1 << 11,
}

export class ProcessorBuilder {
    static create(name: string, args?: Array<any> | IArguments): ProcessorBuilder {
        return new ProcessorBuilder(name, args);
    }

    constructor(public name: string, public args?: Array<any> | IArguments) {
    }

    private _setter: Function;

    public setter(fn: Function): ProcessorBuilder {
        this._setter = fn;
        return this;
    }

    private _getter: Function;

    public getter(fn: Function): ProcessorBuilder {
        this._getter = fn;
        return this;
    }

    private _value: Function;

    public value(fn: Function): ProcessorBuilder {
        this._value = fn;
        return this;
    }

    private _anyAccessors: Function;

    public anyAccessors(fn: Function): ProcessorBuilder {
        this._anyAccessors = fn;
        return this;
    }

    private _isValueProcessor: boolean = false;

    public isValueProcessor(): ProcessorBuilder {
        this._isValueProcessor = true;
        return this;
    }

    private _isPropertyDescriptionProcessor: boolean = false;

    public isPropertyDescriptionProcessor(): ProcessorBuilder {
        this._isPropertyDescriptionProcessor = true;
        return this;
    }

    private _isAfterCall: boolean = false;

    public isAfterCall(): ProcessorBuilder {
        this._isAfterCall = true;
        return this;
    }

    private _debug: boolean = false;

    public debug(): ProcessorBuilder {
        this._debug = true;
        return this;
    }

    public build(): Processor {
        var p = new Processor();
        p.name = this.name;
        p.args = this.args || [];
        p.debug = this._debug;

        if (this._isAfterCall) p.type |= ProcessorType.AFTER_CALL_PROCESSOR;

        if (this._isValueProcessor) p.type |= ProcessorType.VALUE_PROCESSOR;
        else if (this._isPropertyDescriptionProcessor) p.type |= ProcessorType.PROPERTY_DESCRIPTION_PROCESSOR;
        else p.type |= ProcessorType.VALUE_PROCESSOR;

        if (this._anyAccessors) {
            p.handlers.get = this._anyAccessors;
            p.handlers.set = this._anyAccessors;
            p.handlers.value = this._anyAccessors;
            p.type |= AccessorType.GET | AccessorType.SET;
        }
        else if (this._getter) {
            p.handlers.get = this._getter;
            p.type |= AccessorType.GET;
        }
        else if (this._setter) {
            p.handlers.set = this._setter;
            p.type |= AccessorType.SET;
        }
        else if (this._value) {
            p.handlers.value = this._value;
        }

        return p;
    }
}

export class Processor {

    public name: string;
    public args: Array<any>|IArguments;

    public debug: boolean;

    public type: number = 0;
    public handlers: {get?:Function; set?:Function; value?:Function} = {};

    private hasPropertyDescriptor(): boolean {
        return this.args[2] &&
            typeof this.args[2] == "object" &&
            this.args[2].hasOwnProperty("enumerable");
    }

    public get isClassDecorator(): boolean {
        return this.args.length == 1 &&
            typeof this.args[0] == "function" &&
            this.args[0].constructor != null;
    }

    public get isPropertyDecorator(): boolean {
        return this.args.length == 2 &&
            typeof this.args[0] == "object" &&
            typeof this.args[1] == "string";
    }

    public get isMethodParameterDecorator(): boolean {
        return this.args.length == 3 &&
            typeof this.args[0] == "object" &&
            typeof this.args[1] == "string" &&
            typeof this.args[2] == "number";
    }

    public get isMethodDecorator(): boolean {
        return this.args.length == 3 &&
            typeof this.args[0] == "object" &&
            typeof this.args[1] == "string" &&
            this.hasPropertyDescriptor();
    }

    public get isStaticMethodDecorator(): boolean {
        return this.args.length == 3 &&
            typeof this.args[0] == "function" &&
            typeof this.args[1] == "string" &&
            this.hasPropertyDescriptor();
    }

    public get isMethod(): boolean {
        return (this.args[2]) ? ((this.args[2].value != null) ? true : (typeof this.args[2] == "number")) : false;
    }

    public create() {

        this.log("create")

        if (this.type & ProcessorType.AFTER_CALL_PROCESSOR) {
            return this.processAfterCall();
        }
        else {
            return this.process();
        }
    }

    private processAfterCall() {

        this.log("postProcess");

        var ths = this;
        return function (...args) {
            ths.log("post-handler", ths.args);
            ths.args = args;
            return ths.process();
        };
    }

    public currentProcessTypeMask: ProcessType;

    private process() {

        this.log("process");

        if (this.isClassDecorator) return this.processClass();
        else if (this.isPropertyDecorator) return this.processProperty();
        else if (this.isMethodParameterDecorator) return this.processMethodParameter();
        else if (this.isStaticMethodDecorator) return this.processMethod();
        else if (this.isMethodDecorator) return this.processMethod();

        return this.processAfterCall();
    }

    private processClass() {

        this.log("processClass");
        var fn = this.handlers.get || this.handlers.value;
        return fn(this.args[0]);
    }

    private processProperty() {

        this.log("processProperty");
        var fn = this.handlers.get || this.handlers.value;
        return fn(this.args[0], this.args[1]);
    }

    private processMethodParameter() {

        this.log("processMethodParameter");

        var target: any = this.args[0];
        var propertyKey: string = this.args[1];
        var paramId: number = this.args[2];

        var oldDescriptor = Object.getOwnPropertyDescriptor(target, propertyKey);
        var newDescriptor = this.createDescriptor(oldDescriptor);

        var ths = this;

        newDescriptor.value = function (...args) {
            ths.currentProcessTypeMask = ProcessType.METHOD_PARAMETER;
            var newArg = ths.handlers.value.apply(this, [args[paramId]]);
            if (newArg !== undefined) args[paramId] = newArg;
            oldDescriptor.value.apply(this, args);
        };
        Object.defineProperty(this.args[0], this.args[1], newDescriptor);
    }

    private processStaticMethod() {
        this.log("processStaticMethod");
        return this._processMethod();
    }

    private processMethod() {
        this.log("processMethod");
        return this._processMethod();
    }

    private _processMethod() {

        var target: any = this.args[0];
        var propertyKey: string = this.args[1];
        var oldDescriptor: PropertyDescriptor = this.args[2];
        var newDescriptor = this.createDescriptor(oldDescriptor);

        var ths = this;

        if (this.type & ProcessorType.PROPERTY_DESCRIPTION_PROCESSOR) {

            this.log("PROPERTY_DESCRIPTION_PROCESSOR");

            if (this.isMethod)
                newDescriptor.value = function (...args) {
                    ths.log("descriptor.value", ths.args, args);
                    ths.currentProcessTypeMask = ProcessType.METHOD_APPLY;
                    return ths.handlers.value.apply(this, args);
                };
            else {

                if (this.type & AccessorType.GET)
                    newDescriptor.get = function (...args) {
                        ths.log("descriptor.get", ths.args, args);
                        ths.currentProcessTypeMask = ProcessType.ACCESSOR | AccessorType.GET;
                        var ret = ths.handlers.get.apply(this, args);
                        return ret;
                    };

                if (this.type & AccessorType.SET)
                    newDescriptor.set = function (...args) {
                        ths.log("descriptor.set", ths.args, args);
                        ths.currentProcessTypeMask = ProcessType.ACCESSOR | AccessorType.SET;
                        var ret = ths.handlers.set.apply(this, args);
                        return ret;
                    };
            }
        }

        if (this.type & ProcessorType.VALUE_PROCESSOR) {

            this.log("VALUE_PROCESSOR");

            if (this.isMethod) {
                newDescriptor.value = function (...args) {
                    ths.log("VALUE_PROCESSOR method", ths.args, args);
                    ths.currentProcessTypeMask = ProcessType.METHOD_APPLY;
                    var values = ths.processValues(this, ths.handlers.value, args);
                    if (values === undefined) values = args;
                    var ret = oldDescriptor.value.apply(this, values);
                    return ret;
                };
            }
            else {

                if (this.type & AccessorType.GET) {
                    newDescriptor.get = function (...args) {
                        ths.log("VALUE_PROCESSOR get", ths.args, args);
                        ths.currentProcessTypeMask = ProcessType.ACCESSOR | AccessorType.GET;
                        var oldValue = oldDescriptor.get.apply(this, args);
                        var newValue = ths.processValues(this, ths.handlers.get, [oldValue])[0];
                        if (newValue === undefined) newValue = oldValue;
                        return newValue;
                    }
                }

                if (this.type & AccessorType.SET) {
                    newDescriptor.set = function (...args) {
                        ths.log("VALUE_PROCESSOR set", ths.args, args);
                        ths.currentProcessTypeMask = ProcessType.ACCESSOR | AccessorType.SET;
                        var newValue = ths.processValues(this, ths.handlers.set, args);
                        if (newValue === undefined) newValue = args;
                        return oldDescriptor.set.apply(this, newValue);
                    }
                }
            }
        }

        return newDescriptor;
    }

    private createDescriptor(desc: PropertyDescriptor): PropertyDescriptor {
        var newDescriptor = <any>{};
        for (var key in desc)
            if (desc.hasOwnProperty(key))
                newDescriptor[key] = (<any>desc)[key];

        return newDescriptor;
    }

    private log(...args) {
        if (this.debug && console && console.log)
            console.log.apply(console, ["Processor[" + this.name + "]"].concat(args));
    }

    private processValues(target: any, handler: Function, values: Array<any>): Array<any> {
        var ret = handler.apply(target, values);
        if (!ret) return values;
        if (!Array.isArray(ret)) return [ret];
        return ret;
    }
}