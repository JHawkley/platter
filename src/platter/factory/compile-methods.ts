import { IGeneratorMethod } from './generator';

type MethodsMap = { [name: string]: IGeneratorMethod };

function compileMethods(methods: Array<IGeneratorMethod>): MethodsMap {
  let retVal: MethodsMap = {};
  for (let i = 0, len = methods.length; i < len; i++)
    retVal[methods[i].name] = methods[i];
  return retVal;
}

export default compileMethods;