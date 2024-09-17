const g = global as unknown as { __singletons: Record<string, unknown> };
g.__singletons ??= {};

export const singleton = <Value>(
  name: string,
  valueFactory: () => Promise<Value>,
  id?: string, // ブラウザまたはコンテキストのIDを追加
): Promise<Value> => {
  const uniqueName = id ? `${name}_${id}` : name; // IDがあればそれを使って一意の名前を生成
  g.__singletons[uniqueName] ??= valueFactory();
  return g.__singletons[uniqueName] as Promise<Value>;
};

export const destroySingleton = (name: string, id?: string) => {
  const uniqueName = id ? `${name}_${id}` : name;
  delete g.__singletons[uniqueName];
};