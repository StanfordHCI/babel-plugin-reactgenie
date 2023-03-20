import Based from 'based';
import DecoFn from 'decorator';
import { Some } from 'some';
import { Args, Context } from '@nestjs/graphql';
import { Xyz } from 'xyz';

@Based
class Named {
  constructor(
    @DecoFn(Some) private param: Some,
    @DecoFn private param2: Some,
  ) {}

  @Based()
  methodName(
    @Args() args: Args,
    @Context() context: Context,
    @DecoFn(Xyz) xyz: any
  ) {}

  @Based()
  static staticMethod(
    arg1: string,
    arg2: number,
    arg3: boolean
  ) : number { return 0; }

  static staticProperty: number = 0;
  memberProperty: string = "member";

  @Based()
  destructuringMethod(
    { arg1, arg2, arg3 }: { arg1: string, arg2: number, arg3: boolean }
  ) : string { return "success"; }

  @Based()
  arrayMethod(): string[] { return ["success"]; }
}
