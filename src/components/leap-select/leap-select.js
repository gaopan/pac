// Support Documentation - https://github.houston.entsvcs.net/LEAP/documents/blob/master/support/website-components/leap-select/leap-select.md
// Please modify the documentation if you made any changes or updates

import TypeChecker from '@/utils/type-checker.js'
import Internationalization from '@/utils/internationalization.js'
import { multiSelectItemModel, multiSelectItemEventModel, emitSelectedValuesModel } from './leap-select-data-model.js'
import shared from "@/shared.js"

var eventHub = shared.eventHub;

export default {
  name: 'leap-select',
  props: {
    property: {
      type: String,
      required: false
    },
    isMultiSelect: {
      type: Boolean,
      required: false,
      default: false
    },
    stylesConf: {
      type: Object,
      required: false
    },
    options: {
      type: null,
      required: true
    },
    hasError: {
      type: Boolean,
      required: false,
      default: false
    },
    defaultLabelTitle: {
      type: String,
      required: false,
      default: Internationalization.translate('please select')
    },
    initSelectedValue: {
      type: String,
      required: false
    },
    defaultIconArrow: {
      type: String,
      required: false,
    },
    isSearch: {
      type: Boolean,
      required: false,
      default: false
    },
    index: {
      //NOTE: don't know the purpose of this prop
      type: Number,
      required: false
    },
    isFilterTable: {
      type: Boolean,
      required: false,
      default: false
    },
    isDisplayCheckedNumberLabel: {
      type: Boolean,
      required: false,
      default: false
    },
    checkedNumberLabel: {
      type: Object,
      required: false
    },
    alwaysSelectAllOption: { //fangzheng-qing.liao@hpe.com: add alway select all option
      type: Boolean,
      required: false,
      default: false
    },
    isAlwaysSelectAll: {
      type: Boolean,
      required: false,
      default: false
    },
    singleSelectDefaultValue: { //fangzheng-qing.liao@hpe.com: add set default selected option for single select
      type: Object,
      required: false
    }
  },
  data() {
    return {
      label: null,
      multiSelectLabel: null,
      multiSelectOptions: [],
      sizeOfMultiSelectOptions: (this.$props.isMultiSelect) ? this.$props.options.length : null,
      isOptionsNull: false,
      isArrowUp: false,
      searchKey: ''
    }
  },
  created() {
    this.fnInit();
  },
  computed: {
    styles() {
      return (this.$props.stylesConf) ? this.$props.stylesConf : [];
    }
  },
  watch: {
    options: {
      handler: function(newVal, oldVal) {

        this.fnInit();

        if (this.$props.isMultiSelect) {
          this.$data.sizeOfMultiSelectOptions = newVal.length;
        }

      },
      deep: true
    },
    initSelectedValue(value) {
      this.$data.label = (value) ? this.fnGetUpdatedLabel(value) : this.$props.defaultLabelTitle;
    }
  },
  methods: {
    fnInit() {

      if (this.$props.defaultIconArrow) {
        this.$data.isArrowUp = (this.$props.defaultIconArrow == 'up') ? true : false;
      }

      if (this.$props.options.length == 0) {

        //disabled dropdown when options is null
        this.$data.isOptionsNull = true;
        this.$data.label = (!this.$data.isMultiSelect) ? Internationalization.translate("No options to select") : null;
        this.$data.multiSelectLabel = (this.$data.isMultiSelect) ? Internationalization.translate("No options to select") : null;

      } else {

        this.$data.isOptionsNull = false;

        this.$data.label = (!this.$data.isMultiSelect && this.$props.initSelectedValue) ?
          this.fnGetUpdatedLabel(this.$props.initSelectedValue) : this.$props.defaultLabelTitle;

        if (this.$props.isMultiSelect) {
          this.fnSetMultiSelectOptions();
          this.fnUpdateMultiSelectLabel();
        }
        if(this.$props.singleSelectDefaultValue){
          this.onChangeSingleSelect(this.$props.singleSelectDefaultValue)
        }
      }

    },
    fnGetUpdatedLabel(value) {
      //If value don't exist on options list(name/value), will use the defaultLabelTitle
      let selected = this.$props.defaultLabelTitle;

      for (let item of this.$props.options) {

        if (item.name == value || item.value == value) {
          selected = item.name;
        }

      }

      return selected.trim();

    },
    fnUpdateMultiSelectLabel() {

      let getSelectedMultiSelect = this.fnGetSelectedMultiSelect(),
        sizeOfSelectedMultiList = getSelectedMultiSelect.length;

      if (sizeOfSelectedMultiList == 0) {

        this.$data.multiSelectLabel = this.$props.defaultLabelTitle;

      } else {

        switch (this.$props.isDisplayCheckedNumberLabel) {

          case false:

            if (this.$data.sizeOfMultiSelectOptions == sizeOfSelectedMultiList && this.$data.sizeOfMultiSelectOptions > 1) {

              this.$data.multiSelectLabel = Internationalization.translate("All");

            } else {

              this.$data.multiSelectLabel = (sizeOfSelectedMultiList > 1) ? getSelectedMultiSelect.join(", ") : getSelectedMultiSelect[0];

            }

            break;

          default:

            this.$data.multiSelectLabel = this.fnGetCheckedNumberLabel(sizeOfSelectedMultiList);

        }

      }

    },
    fnGetCheckedNumberLabel(sizeOfSelectedMultiList) {

      let singular = `${sizeOfSelectedMultiList} ${this.$props.checkedNumberLabel.singular}`,
        plural = `${sizeOfSelectedMultiList} ${this.$props.checkedNumberLabel.plural}`;

      return (sizeOfSelectedMultiList > 1) ? plural : singular;

    },
    fnSetMultiSelectOptions() {

      let id = 0,
        multiSelectArr = [];

      //Always Select All Item
      if (this.alwaysSelectAllOption) {
        let alwaysSelectAllItem = new multiSelectItemModel().model

        alwaysSelectAllItem.name = 'Always Select All'
        alwaysSelectAllItem.value = 'always select all'
        id++

        multiSelectArr.push(alwaysSelectAllItem)
      }

      //Select All Item
      let selectAllItem = new multiSelectItemModel().model;
      selectAllItem.id = id;

      multiSelectArr.push(selectAllItem);

      for (let obj of this.$props.options) {

        let multiSelectItem = new multiSelectItemModel().model;

        multiSelectItem.id = ++id;
        multiSelectItem.name = obj.name;
        multiSelectItem.value = obj.value;
        multiSelectItem.isSelected = obj.checked;
        multiSelectItem.isHightlighted = obj.checked;
        multiSelectItem.isDisableClick = (obj.disableClick) ? obj.disableClick : false;

        multiSelectArr.push(multiSelectItem);

      }

      this.$data.multiSelectOptions = multiSelectArr;

      let sizeOfSelectedMultiList = this.fnGetSelectedMultiSelect().length;
      let selectAllStatus = (this.$data.sizeOfMultiSelectOptions != 0 && (sizeOfSelectedMultiList == this.$data.sizeOfMultiSelectOptions)) ? true : false
        //update the selected & hightlighted for Select All
      if (this.$props.alwaysSelectAllOption) {
        if (this.$props.isAlwaysSelectAll) {
          this.$data.multiSelectOptions[0].isSelected = selectAllStatus;
          this.$data.multiSelectOptions[0].isHightlighted = selectAllStatus;
        } else {
          this.$data.multiSelectOptions[1].isSelected = selectAllStatus;
          this.$data.multiSelectOptions[1].isHightlighted = selectAllStatus;
        }
      } else {
        this.$data.multiSelectOptions[0].isSelected = selectAllStatus;
        this.$data.multiSelectOptions[0].isHightlighted = selectAllStatus;
      }

    },
    fnUpdateSelectedMultiSelectOptions(selected) {
      if (selected.name == 'Select All') {

        for (var index in this.$data.multiSelectOptions) {
          if (!this.$data.multiSelectOptions[index].isDisableClick) {
            this.$data.multiSelectOptions[index].isSelected = selected.isChecked;

            if (index == 0) {
              this.$data.multiSelectOptions[index].isHightlighted = selected.isChecked;
            } else {
              if (selected.isChecked) {
                this.$data.multiSelectOptions[index].isHightlighted = false
              }
            }
          }

        }

      } else {

        this.$data.multiSelectOptions[selected.id].isSelected = selected.isChecked;
        this.$data.multiSelectOptions[selected.id].isHightlighted = selected.isChecked;

        let sizeOfSelectedMultiList = this.fnGetSelectedMultiSelect().length;

        if (sizeOfSelectedMultiList == this.$data.sizeOfMultiSelectOptions) {
          this.$data.multiSelectOptions[0].isSelected = true;
          this.$data.multiSelectOptions[0].isHightlighted = true;

          for (let index in this.$data.multiSelectOptions) {
            if (index != 0 && this.$data.multiSelectOptions[index].isSelected) {
              this.$data.multiSelectOptions[index].isHightlighted = false;
            }
          }

        } else {
          this.$data.multiSelectOptions[0].isSelected = false;

          for (let index in this.$data.multiSelectOptions) {
            if (index != 0 && this.$data.multiSelectOptions[index].isSelected) {
              this.$data.multiSelectOptions[index].isHightlighted = true;
            }
          }
        }

      }
    },

    fnUpdateSelectedMultiSelectOptionsWithinAlwaysSelectAll(selected) {
      if (selected.name == 'Always Select All') {
        for (var index in this.$data.multiSelectOptions) {
          if (!this.$data.multiSelectOptions[index].isDisableClick) {
            if (this.$data.multiSelectOptions[index].name === 'Select All') {
              if (this.$data.multiSelectOptions[index].isSelected) {
                this.$data.multiSelectOptions[index].isSelected = false;
              }
            } else {
              this.$data.multiSelectOptions[index].isSelected = selected.isChecked;

              if (index == 0) {
                this.$data.multiSelectOptions[index].isHightlighted = selected.isChecked;
              } else {
                if (selected.isChecked) {
                  this.$data.multiSelectOptions[index].isHightlighted = false
                }
              }
            }
          }

        }
      } else if (selected.name == 'Select All') {

        for (var index in this.$data.multiSelectOptions) {
          if (!this.$data.multiSelectOptions[index].isDisableClick) {
            if (this.$data.multiSelectOptions[index].name === 'Always Select All') {
              if (this.$data.multiSelectOptions[index].isSelected) {
                this.$data.multiSelectOptions[index].isSelected = false;
              }
            } else {
              this.$data.multiSelectOptions[index].isSelected = selected.isChecked;

              if (index == 1) {
                this.$data.multiSelectOptions[index].isHightlighted = selected.isChecked;
              } else {
                if (selected.isChecked) {
                  this.$data.multiSelectOptions[index].isHightlighted = false
                }
              }
            }
          }

        }

      } else {

        this.$data.multiSelectOptions[selected.id].isSelected = selected.isChecked;
        this.$data.multiSelectOptions[selected.id].isHightlighted = selected.isChecked;

        let sizeOfSelectedMultiList = this.fnGetSelectedMultiSelect().length;

        if (sizeOfSelectedMultiList == this.$data.sizeOfMultiSelectOptions) {
          this.$data.multiSelectOptions[0].isSelected = true;
          this.$data.multiSelectOptions[0].isHightlighted = true;

          for (let index in this.$data.multiSelectOptions) {
            if (index != 0 && this.$data.multiSelectOptions[index].isSelected) {
              this.$data.multiSelectOptions[index].isHightlighted = false;
            }
          }

        } else {
          this.$data.multiSelectOptions[0].isSelected = false;

          for (let index in this.$data.multiSelectOptions) {
            if (index != 0 && this.$data.multiSelectOptions[index].isSelected) {
              this.$data.multiSelectOptions[index].isHightlighted = true;
            }
          }
        }

      }

      this.alwaysSelectAll = this.$data.multiSelectOptions[0].isSelected
    },

    fnGetSelectedMultiSelect(isGetValueData) {

      let arr = [];

      for (let obj of this.$data.multiSelectOptions) {

        if (obj.isSelected && obj.name != 'Select All' && obj.name != 'Always Select All') {
          // UI - using name,
          // Emitted data - using value
          (isGetValueData) ?
          arr.push(obj.value): arr.push(obj.name);

        }

      }

      return arr;

    },
    onClickProcessLabel(event) {

      let dropdownContainer = event.currentTarget,
        dropdownMenu = $('.dropdown-group .dropdown-menu'),
        position = dropdownContainer.getBoundingClientRect().top,
        buttonHeight = dropdownContainer.getBoundingClientRect().height,
        menuHeight = dropdownMenu.outerHeight(),
        $win = $(window);

      if (TypeChecker.isUndefined(this.$props.defaultIconArrow)) {

        this.$data.isArrowUp = (position > menuHeight && $win.height() - position < buttonHeight + menuHeight) ? true : false;

      }

      // eventHub.$emit('select-index', this.index);

    },
    onClickMultiSelect(event) {
      event.stopPropagation();
    },
    onChangeMultiSelect(event) {

      let selected = new multiSelectItemEventModel().model;

      selected.id = parseInt(event.target.id);
      selected.name = event.target.value;
      selected.isChecked = event.target.checked;
      if (this.alwaysSelectAllOption) {
        this.fnUpdateSelectedMultiSelectOptionsWithinAlwaysSelectAll(selected);
      } else {
        this.fnUpdateSelectedMultiSelectOptions(selected);
      }
      this.fnUpdateMultiSelectLabel();

      //send updated selected values
      this.emitOnChangeSelectedValues(this.fnGetSelectedMultiSelect(true));

    },
    onChangeSingleSelect(data) {
      //update label for case: single selection
      this.label = data.name;

      //send updated selection value
      this.emitOnChangeSelectedValues(data.value);

    },
    emitOnChangeSelectedValues(value) {

      let emitSelectedValues = new emitSelectedValuesModel().model;

      emitSelectedValues.propertyId = (this.$props.property) ? this.$props.property : '';
      emitSelectedValues.value = value;

      if (this.alwaysSelectAllOption) {
        emitSelectedValues['alwaysSelectAll'] = this.alwaysSelectAll
      }
      this.$emit('onSelectedValues', emitSelectedValues);
    }
  }
}
