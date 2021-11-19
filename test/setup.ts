import 'jest-extended/all';
import 'jest-extended';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFunction = (...args: any[]) => unknown;

export function asMockedFunction<T extends AnyFunction = never>(): jest.MockedFunction<T>;

export function asMockedFunction<T extends AnyFunction>(fn: T): jest.MockedFunction<T>;

export function asMockedFunction<T extends AnyFunction>(fn?: T): jest.MockedFunction<T> {
  return (fn || jest.fn()) as unknown as jest.MockedFunction<T>;
}
