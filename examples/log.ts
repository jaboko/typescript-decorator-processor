/**
 * Created by jaboko on 04.04.15.
 */

/// <reference path='../lib/processor.ts' />

import { ProcessorBuilder, ProcessType, AccessorType } from '../lib/processor';

export function log(...args) {

    var p = ProcessorBuilder.create("log", args)
        .isValueProcessor()
        .anyAccessors((...values) => {

            var m = p.currentProcessTypeMask;

            var log = (console && console.log) ? console.log : () => {
            };

            var targetName = getFunctionName(p.args[0]);
            var type = ((typeof p.args[0] == "function") ? "static " : "") +
                ((p.isMethod) ? "method" : "accessor");

            if (m & ProcessType.METHOD_APPLY) {
                log("--log--", type, targetName, p.args[1], "(" + values + ")");
            }
            else if (m & ProcessType.METHOD_PARAMETER) {
                log("--log--", type, targetName, p.args[1], "[paramId=" + p.args[2] + "] = " + values);
            }
            else if (m & ProcessType.ACCESSOR) {
                var accType =
                    (m & AccessorType.GET) ? "get" : ((m & AccessorType.SET) ? "set" : "");

                log("--log--", type, accType, "=", p.args[1], values[0]);
            }

        }).build();

    return p.create();
}

function getFunctionName(ent: any) {
    if (typeof ent == "string") return ent;
    if (ent.constructor && ent.constructor.name != "Function") {
        return ent.constructor.name || (ent.toString().match(/function (.+?)\(/) || [, ''])[1];
    } else {
        return ent.name;
    }
}