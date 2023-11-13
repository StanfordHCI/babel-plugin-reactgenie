import { types as t } from '@babel/core';
import { NodePath } from '@babel/traverse';

type InferArray<T> = T extends Array<infer A> ? A : never;

type Parameter = InferArray<t.ClassMethod['params']> | t.ClassProperty;

function createVoidZero() {
  return t.unaryExpression('void', t.numericLiteral(0));
}

/**
 * Given a paramater (or class property) node it returns the first identifier
 * containing the TS Type Annotation.
 *
 * @todo Array and Objects spread are not supported.
 * @todo Rest parameters are not supported.
 */
function getTypedNode(param: Parameter): t.Identifier | t.ClassProperty | t.ObjectPattern | null {
  if (param == null) return null;

  if (param.type === 'ClassProperty') return param;
  if (param.type === 'Identifier') return param;
  if (param.type === 'ObjectPattern') return param;

  if (param.type === 'AssignmentPattern' && param.left.type === 'Identifier')
    return param.left;

  if (param.type === 'TSParameterProperty')
    return getTypedNode(param.parameter);

  return null;
}

export function serializeType(
  classPath: NodePath<t.ClassDeclaration>,
  param: Parameter
) {
  const node = getTypedNode(param);
  if (node == null) return createVoidZero();

  if (!node.typeAnnotation || node.typeAnnotation.type !== 'TSTypeAnnotation')
    return createVoidZero();

  const annotation = node.typeAnnotation.typeAnnotation;
  const className = classPath.node.id ? classPath.node.id.name : '';
  return serializeTypeNode(className, annotation);
}

export function serializeReturnType(
  classPath: NodePath<t.ClassDeclaration>,
  path: NodePath<t.ClassMethod>
) {
  const node = path.node;
  if (!node.returnType || node.returnType.type !== 'TSTypeAnnotation')
    // only support explicit return types
    return undefined;
  const annotation = node.returnType.typeAnnotation;
  const className = classPath.node.id ? classPath.node.id.name : '';
  return serializeTypeNode(className, annotation);
}

export function serializeReturnArrayElementType(
  classPath: NodePath<t.ClassDeclaration>,
  path: NodePath<t.ClassMethod>
) {
  const node = path.node;
  if (!node.returnType || node.returnType.type !== 'TSTypeAnnotation')
    // only support explicit return types
    return undefined;
  const annotation = node.returnType.typeAnnotation;
  if (!t.isTSArrayType(annotation)) return undefined;
  const elementAnnotation = annotation.elementType;
  const className = classPath.node.id ? classPath.node.id.name : '';
  return serializeTypeNode(className, elementAnnotation);
}

export function serializeDestructuringType(
  classPath: NodePath<t.ClassDeclaration>,
  param: Parameter
) {

  if (!t.isObjectPattern(param)) {
    return createVoidZero();
  } else {
    const paramType = param.typeAnnotation;
    if (!paramType || !t.isTSTypeAnnotation(paramType)) {
      return createVoidZero();
    } else {
      const paramLiteralType = paramType.typeAnnotation;
      if (!paramLiteralType || !t.isTSTypeLiteral(paramLiteralType)) {
        return createVoidZero();
      } else {
        const properties = paramLiteralType.members.map(member => {
          if (!t.isTSPropertySignature(member)) {
            throw new Error('Unexpected member type');
          }
          const key = member.key;
          if (!t.isIdentifier(key)) {
            throw new Error('Unexpected key type');
          }
          const annotation = member.typeAnnotation?.typeAnnotation as t.TSType;
          if (!annotation) {
            return t.objectProperty(
              t.identifier(key.name),
              createVoidZero()
            );
          } else {
            var result_array = [
              t.objectProperty(t.identifier('type'), serializeTypeNode("", annotation)),
              t.objectProperty(t.identifier('optional'), t.booleanLiteral(member.optional == true))
            ];
            return t.objectProperty(
              t.identifier(key.name),
              t.objectExpression(result_array)
            );
          }
        });
        return t.objectExpression(properties);
      }
    }
  }
}

export function serializeDestructuringDefaultValues(
  classPath: NodePath<t.ClassDeclaration>,
  param: Parameter
) {
  // param = {"type":"ObjectPattern","start":899,"end":996,"loc":{"start":{"line":47,"column":4,"index":899},"end":{"line":47,"column":101,"index":996}},"properties":[{"type":"ObjectProperty","start":901,"end":905,"loc":{"start":{"line":47,"column":6,"index":901},"end":{"line":47,"column":10,"index":905}},"key":{"type":"Identifier","start":901,"end":905,"loc":{"start":{"line":47,"column":6,"index":901},"end":{"line":47,"column":10,"index":905},"identifierName":"arg1"},"name":"arg1"},"computed":false,"method":false,"shorthand":true,"value":{"type":"Identifier","start":901,"end":905,"loc":{"start":{"line":47,"column":6,"index":901},"end":{"line":47,"column":10,"index":905},"identifierName":"arg1"},"name":"arg1"},"extra":{"shorthand":true}},{"type":"ObjectProperty","start":907,"end":915,"loc":{"start":{"line":47,"column":12,"index":907},"end":{"line":47,"column":20,"index":915}},"key":{"type":"Identifier","start":907,"end":911,"loc":{"start":{"line":47,"column":12,"index":907},"end":{"line":47,"column":16,"index":911},"identifierName":"arg2"},"name":"arg2"},"computed":false,"method":false,"shorthand":true,"value":{"type":"AssignmentPattern","start":907,"end":915,"loc":{"start":{"line":47,"column":12,"index":907},"end":{"line":47,"column":20,"index":915}},"left":{"type":"Identifier","start":907,"end":911,"loc":{"start":{"line":47,"column":12,"index":907},"end":{"line":47,"column":16,"index":911},"identifierName":"arg2"},"name":"arg2"},"right":{"type":"NumericLiteral","start":914,"end":915,"loc":{"start":{"line":47,"column":19,"index":914},"end":{"line":47,"column":20,"index":915}},"extra":{"rawValue":0,"raw":"0"},"value":0}},"extra":{"shorthand":true}},{"type":"ObjectProperty","start":917,"end":921,"loc":{"start":{"line":47,"column":22,"index":917},"end":{"line":47,"column":26,"index":921}},"key":{"type":"Identifier","start":917,"end":921,"loc":{"start":{"line":47,"column":22,"index":917},"end":{"line":47,"column":26,"index":921},"identifierName":"arg3"},"name":"arg3"},"computed":false,"method":false,"shorthand":true,"value":{"type":"Identifier","start":917,"end":921,"loc":{"start":{"line":47,"column":22,"index":917},"end":{"line":47,"column":26,"index":921},"identifierName":"arg3"},"name":"arg3"},"extra":{"shorthand":true}},{"type":"ObjectProperty","start":923,"end":927,"loc":{"start":{"line":47,"column":28,"index":923},"end":{"line":47,"column":32,"index":927}},"key":{"type":"Identifier","start":923,"end":927,"loc":{"start":{"line":47,"column":28,"index":923},"end":{"line":47,"column":32,"index":927},"identifierName":"arg4"},"name":"arg4"},"computed":false,"method":false,"shorthand":true,"value":{"type":"Identifier","start":923,"end":927,"loc":{"start":{"line":47,"column":28,"index":923},"end":{"line":47,"column":32,"index":927},"identifierName":"arg4"},"name":"arg4"},"extra":{"shorthand":true}}],"typeAnnotation":{"type":"TSTypeAnnotation","start":929,"end":996,"loc":{"start":{"line":47,"column":34,"index":929},"end":{"line":47,"column":101,"index":996}},"typeAnnotation":{"type":"TSTypeLiteral","start":931,"end":996,"loc":{"start":{"line":47,"column":36,"index":931},"end":{"line":47,"column":101,"index":996}},"members":[{"type":"TSPropertySignature","start":933,"end":946,"loc":{"start":{"line":47,"column":38,"index":933},"end":{"line":47,"column":51,"index":946}},"key":{"type":"Identifier","start":933,"end":937,"loc":{"start":{"line":47,"column":38,"index":933},"end":{"line":47,"column":42,"index":937},"identifierName":"arg1"},"name":"arg1"},"computed":false,"typeAnnotation":{"type":"TSTypeAnnotation","start":937,"end":945,"loc":{"start":{"line":47,"column":42,"index":937},"end":{"line":47,"column":50,"index":945}},"typeAnnotation":{"type":"TSStringKeyword","start":939,"end":945,"loc":{"start":{"line":47,"column":44,"index":939},"end":{"line":47,"column":50,"index":945}}}}},{"type":"TSPropertySignature","start":947,"end":961,"loc":{"start":{"line":47,"column":52,"index":947},"end":{"line":47,"column":66,"index":961}},"key":{"type":"Identifier","start":947,"end":951,"loc":{"start":{"line":47,"column":52,"index":947},"end":{"line":47,"column":56,"index":951},"identifierName":"arg2"},"name":"arg2"},"computed":false,"optional":true,"typeAnnotation":{"type":"TSTypeAnnotation","start":952,"end":960,"loc":{"start":{"line":47,"column":57,"index":952},"end":{"line":47,"column":65,"index":960}},"typeAnnotation":{"type":"TSNumberKeyword","start":954,"end":960,"loc":{"start":{"line":47,"column":59,"index":954},"end":{"line":47,"column":65,"index":960}}}}},{"type":"TSPropertySignature","start":962,"end":980,"loc":{"start":{"line":47,"column":67,"index":962},"end":{"line":47,"column":85,"index":980}},"key":{"type":"Identifier","start":962,"end":966,"loc":{"start":{"line":47,"column":67,"index":962},"end":{"line":47,"column":71,"index":966},"identifierName":"arg3"},"name":"arg3"},"computed":false,"typeAnnotation":{"type":"TSTypeAnnotation","start":966,"end":979,"loc":{"start":{"line":47,"column":71,"index":966},"end":{"line":47,"column":84,"index":979}},"typeAnnotation":{"type":"TSArrayType","start":968,"end":979,"loc":{"start":{"line":47,"column":73,"index":968},"end":{"line":47,"column":84,"index":979}},"elementType":{"type":"TSTypeReference","start":968,"end":977,"loc":{"start":{"line":47,"column":73,"index":968},"end":{"line":47,"column":82,"index":977}},"typeName":{"type":"Identifier","start":968,"end":977,"loc":{"start":{"line":47,"column":73,"index":968},"end":{"line":47,"column":82,"index":977},"identifierName":"SomeClass"},"name":"SomeClass"}}}}},{"type":"TSPropertySignature","start":981,"end":994,"loc":{"start":{"line":47,"column":86,"index":981},"end":{"line":47,"column":99,"index":994}},"key":{"type":"Identifier","start":981,"end":985,"loc":{"start":{"line":47,"column":86,"index":981},"end":{"line":47,"column":90,"index":985},"identifierName":"arg4"},"name":"arg4"},"computed":false,"optional":true,"typeAnnotation":{"type":"TSTypeAnnotation","start":986,"end":994,"loc":{"start":{"line":47,"column":91,"index":986},"end":{"line":47,"column":99,"index":994}},"typeAnnotation":{"type":"TSStringKeyword","start":988,"end":994,"loc":{"start":{"line":47,"column":93,"index":988},"end":{"line":47,"column":99,"index":994}}}}}]}}}
  if (!t.isObjectPattern(param)) {
    return createVoidZero();
  } else {
    const paramProperties = param.properties;
    if (!paramProperties) {
      return createVoidZero();
    } else {
      const properties = paramProperties.map(member => {
        if (!t.isObjectProperty(member)) {
          throw new Error('Unexpected member type');
        }
        const key = member.key;
        if (!t.isIdentifier(key)) {
          throw new Error('Unexpected key type');
        }
        const value: t.Node = member.value;
        if (value.type !== 'AssignmentPattern') {
          return t.objectProperty(
            t.identifier(key.name),
            createVoidZero()
          );
        } else {
          const valueExpression: t.Node = value.right;
          if (!valueExpression) {
            return t.objectProperty(
              t.identifier(key.name),
              createVoidZero()
            );
          } else {
            const expressionStart = valueExpression.start;
            const expressionEnd = valueExpression.end;
            const classStart = classPath.node.start;
            if (!expressionStart || !expressionEnd || !classStart) {
              return t.objectProperty(
                t.identifier(key.name),
                createVoidZero()
              );
            } else {
              return t.objectProperty(
                t.identifier(key.name),
                t.stringLiteral(classPath.getSource().substring(expressionStart - classStart, expressionEnd - classStart))
              );
            }
          }
        }
      });
      return t.objectExpression(properties);
    }
  }
}

function serializeTypeReferenceNode(
  className: string,
  node: t.TSTypeReference
) {
  /**
   * We need to save references to this type since it is going
   * to be used as a Value (and not just as a Type) here.
   *
   * This is resolved in main plugin method, calling
   * `path.scope.crawl()` which updates the bindings.
   */
  const reference = serializeReference(node.typeName);

  /**
   * We should omit references to self (class) since it will throw a
   * ReferenceError at runtime due to babel transpile output.
   */
  if (isClassType(className, reference)) {
    return t.stringLiteral('name' in reference ? reference.name : 'Object');
  }

  /**
   * We don't know if type is just a type (interface, etc.) or a concrete
   * value (class, etc.).
   * `typeof` operator allows us to use the expression even if it is not
   * defined, fallback is just `Object`.
   */
  return t.conditionalExpression(
    t.binaryExpression(
      '===',
      t.unaryExpression('typeof', reference),
      t.stringLiteral('undefined')
    ),
    t.stringLiteral('name' in reference ? reference.name : 'Object'),
    t.cloneDeep(reference)
  );
}

/**
 * Checks if node (this should be the result of `serializeReference`) member
 * expression or identifier is a reference to self (class name).
 * In this case, we just emit `Object` in order to avoid ReferenceError.
 */
export function isClassType(className: string, node: t.Expression): boolean {
  switch (node.type) {
    case 'Identifier':
      return node.name === className;
    case 'MemberExpression':
      return isClassType(className, node.object);
    default:
      throw new Error(
        `The property expression at ${node.start} is not valid as a Type to be used in Reflect.metadata`
      );
  }
}

function serializeReference(
  typeName: t.Identifier | t.TSQualifiedName
): t.Identifier | t.MemberExpression {
  if (typeName.type === 'Identifier') {
    return t.identifier(typeName.name);
  }
  return t.memberExpression(serializeReference(typeName.left), typeName.right);
}

type SerializedType =
  | t.Identifier
  | t.UnaryExpression
  | t.ConditionalExpression
  | t.ObjectExpression
  | t.StringLiteral;

/**
 * Actual serialization given the TS Type annotation.
 * Result tries to get the best match given the information available.
 *
 * Implementation is adapted from original TSC compiler source as
 * available here:
 *  https://github.com/Microsoft/TypeScript/blob/2932421370df720f0ccfea63aaf628e32e881429/src/compiler/transformers/ts.ts
 */
function serializeTypeNode(className: string, node: t.TSType): SerializedType {
  if (node === undefined) {
    return t.identifier('Object');
  }

  switch (node.type) {
    case 'TSVoidKeyword':
    case 'TSUndefinedKeyword':
    case 'TSNullKeyword':
    case 'TSNeverKeyword':
      return t.stringLiteral('void');

    case 'TSParenthesizedType':
      return serializeTypeNode(className, node.typeAnnotation);

    case 'TSFunctionType':
    case 'TSConstructorType':
      return t.identifier('Function');

    case 'TSArrayType':
    case 'TSTupleType':
      // return t.identifier('Array');
      if ('elementType' in node) {
        const elementType = node.elementType;
        return t.objectExpression(
          [
            t.objectProperty(t.identifier('elementType'), serializeTypeNode(className, elementType)),
            t.objectProperty(t.identifier('type'), t.identifier('Array'))
          ]
        );
      } else {
        return t.identifier('Array');
      }

    case 'TSTypePredicate':
    case 'TSBooleanKeyword':
      return t.identifier('Boolean');

    case 'TSStringKeyword':
      return t.identifier('String');

    case 'TSObjectKeyword':
      return t.identifier('Object');

    case 'TSLiteralType':
      switch (node.literal.type) {
        case 'StringLiteral':
          return t.identifier('String');

        case 'NumericLiteral':
          return t.identifier('Number');

        case 'BooleanLiteral':
          return t.identifier('Boolean');

        default:
          /**
           * @todo Use `path` error building method.
           */
          throw new Error('Bad type for decorator' + node.literal);
      }

    case 'TSNumberKeyword':
    case 'TSBigIntKeyword' as any: // Still not in ``@babel/core` typings
      return t.identifier('Number');

    case 'TSSymbolKeyword':
      return t.identifier('Symbol');

    case 'TSTypeReference':
      let referencedNode = node;
      if ("name" in node.typeName && node.typeName.name === 'LazyType') { // meaning the referred type is the actual type
        if (node.typeParameters && node.typeParameters.params.length == 1 && node.typeParameters.params[0].type == 'TSTypeReference') {
          referencedNode = node.typeParameters.params[0];
          return t.stringLiteral('name' in referencedNode.typeName ? referencedNode.typeName.name : 'Object');
        } else {
          throw new Error('LazyType should have exactly one type parameter');
        }
      }
      return serializeTypeReferenceNode(className, referencedNode);

    case 'TSIntersectionType':
    case 'TSUnionType':
      return serializeTypeList(className, node.types);

    case 'TSConditionalType':
      return serializeTypeList(className, [node.trueType, node.falseType]);

    case 'TSTypeQuery':
    case 'TSTypeOperator':
    case 'TSIndexedAccessType':
    case 'TSMappedType':
    case 'TSTypeLiteral':
    case 'TSAnyKeyword':
    case 'TSUnknownKeyword':
    case 'TSThisType':
      //case SyntaxKind.ImportType:
      break;

    default:
      throw new Error('Bad type for decorator');
  }

  return t.identifier('Object');
}

/**
 * Type lists need some refining. Even here, implementation is slightly
 * adapted from original TSC compiler:
 *
 *  https://github.com/Microsoft/TypeScript/blob/2932421370df720f0ccfea63aaf628e32e881429/src/compiler/transformers/ts.ts
 */
function serializeTypeList(
  className: string,
  types: ReadonlyArray<t.TSType>
): SerializedType {
  let serializedUnion: SerializedType | undefined;

  for (let typeNode of types) {
    while (typeNode.type === 'TSParenthesizedType') {
      typeNode = typeNode.typeAnnotation; // Skip parens if need be
    }
    if (typeNode.type === 'TSNeverKeyword') {
      continue; // Always elide `never` from the union/intersection if possible
    }
    if (
      typeNode.type === 'TSNullKeyword' ||
      typeNode.type === 'TSUndefinedKeyword'
    ) {
      continue; // Elide null and undefined from unions for metadata, just like what we did prior to the implementation of strict null checks
    }
    const serializedIndividual = serializeTypeNode(className, typeNode);

    if (
      t.isIdentifier(serializedIndividual) &&
      serializedIndividual.name === 'Object'
    ) {
      // One of the individual is global object, return immediately
      return serializedIndividual;
    }
    // If there exists union that is not void 0 expression, check if the the common type is identifier.
    // anything more complex and we will just default to Object
    else if (serializedUnion) {
      // Different types
      if (
        !t.isIdentifier(serializedUnion) ||
        !t.isIdentifier(serializedIndividual) ||
        serializedUnion.name !== serializedIndividual.name
      ) {
        return t.identifier('Object');
      }
    } else {
      // Initialize the union type
      serializedUnion = serializedIndividual;
    }
  }

  // If we were able to find common type, use it
  return serializedUnion || createVoidZero(); // Fallback is only hit if all union constituients are null/undefined/never
}
