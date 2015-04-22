/**
 * Created by jaboko on 22.04.15.
 */

import { ProcessorBuilder, AccessorType } from '../lib/processor';

export function multi(factor: number | string, accessibleType: AccessorType = AccessorType.GET | AccessorType.SET) {
    var pb = ProcessorBuilder.create("multi", arguments)
        .isValueProcessor();

    if (accessibleType & AccessorType.GET)
        pb.getter((value: number)=> {
            return value * eval(factor.toString());
        })

    if (accessibleType & AccessorType.SET)
        pb.setter((value: number)=> {
            return value * eval(factor.toString());
        })

    return pb.build().create()
}
