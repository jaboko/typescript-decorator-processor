/**
 * Created by jaboko on 22.04.15.
 */

import { ProcessorBuilder, AccessorType } from '../lib/processor';

export function double() {
    return ProcessorBuilder.create("double", arguments)
        .isValueProcessor()
        .anyAccessors((value: number)=> {
            return value * 2;
        }).build().create()
}
