import { FormlyConfig, FormlyExtension, FormlyFieldConfig, FormlyFieldProps } from '@ngx-formly/core';

type PostWrapper = string | { index: number; wrapper: string };

/**
 * Extension that enables appending wrappers to the default configuration.
 *
 * @props **postWrappers** - property that will be used to extend a field's wrappers without overriding the default ones.
 *
 * @usageNotes
 * The array is of type ``<string | {index: number; wrapper: string}>[]``.
 *  It will append the ``string`` wrappers to the configuration and then insert the other wrappers at the designated index.
 */
class PostWrappersExtension implements FormlyExtension {
  constructor(private formlyConfig: FormlyConfig) {}

  prePopulate(field: FormlyFieldConfig): void {
    const props: FormlyFieldProps & { postWrappers?: PostWrapper[] } = field.props;
    if (!props?.postWrappers || props.postWrappers.length === 0) {
      return;
    }
    const wrappers = this.formlyConfig.getType(field.type).wrappers;
    field.wrappers = [...wrappers, ...(props.postWrappers.filter(w => typeof w === 'string') as string[])];
    props.postWrappers
      .filter(w => typeof w !== 'string')
      .forEach((wrapper: { index: number; wrapper: string }) => {
        field.wrappers.splice(wrapper.index, 0, wrapper.wrapper);
      });
  }
}

export function registerPostWrappersExtension(formlyConfig: FormlyConfig) {
  return {
    extensions: [
      {
        name: 'post-wrappers',
        extension: new PostWrappersExtension(formlyConfig),
      },
    ],
  };
}
