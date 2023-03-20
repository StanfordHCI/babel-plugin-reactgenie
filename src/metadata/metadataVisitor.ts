import { NodePath } from '@babel/traverse';
import { types as t } from '@babel/core';
import { serializeReturnType, serializeType } from './serializeType';

function createMetadataDesignDecorator(
  design: 'design:type' | 'design:paramtypes' | 'design:returntype' | 'design:typeinfo',
  typeArg: t.Expression | t.SpreadElement | t.JSXNamespacedName | t.ArgumentPlaceholder
): t.Decorator {
  return t.decorator(
    t.callExpression(
      t.memberExpression(
        t.identifier('Reflect'),
        t.identifier('metadata')
      ),
      [
        t.stringLiteral(design),
        typeArg
      ]
    )
  )
}

export function metadataVisitor(
  classPath: NodePath<t.ClassDeclaration>,
  path: NodePath<t.ClassProperty | t.ClassMethod>
) {
  const field = path.node;
  const classNode = classPath.node;

  switch (field.type) {
    case 'ClassMethod':
      const decorators =
        field.kind === 'constructor' ? classNode.decorators : field.decorators;

      if (!decorators || decorators.length === 0) return;

      decorators!.push(
        createMetadataDesignDecorator(
          'design:type',
          t.identifier('Function')
        )
      );
      decorators!.push(
        createMetadataDesignDecorator(
          'design:paramtypes',
          t.arrayExpression(
            field.params.map(param => serializeType(classPath, param))
          )
        )
      );

      // for ReactGenie, only support explicit return type
      if (field.returnType) {
        const returnType = serializeReturnType(classPath, path as NodePath<t.ClassMethod>);
        if (returnType) {
          decorators!.push(
            createMetadataDesignDecorator(
              'design:returntype',
              returnType
            )
          );
        }
      }
      break;

    case 'ClassProperty':
      if (!field.decorators || field.decorators.length === 0) return;

      if (
        !field.typeAnnotation ||
        field.typeAnnotation.type !== 'TSTypeAnnotation'
      )
        return;

      field.decorators!.push(
        createMetadataDesignDecorator(
          'design:type',
          serializeType(classPath, field)
        )
      );
      break;
  }
}
