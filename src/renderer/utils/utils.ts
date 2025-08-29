import { isObject } from '@vue/shared'
import { cloneDeep } from 'lodash'

/**
 * @description 添加单位
 * @param {String | Number} value 值 100
 * @param {String} unit 单位 px em rem
 */
export const addUnit = (value: string | number, unit = 'px') => {
  return !Object.is(Number(value), NaN) ? `${value}${unit}` : value
}

/**
 * @description 添加单位
 * @param {unknown} value
 * @return {Boolean}
 */
export const isEmpty = (value: unknown) => {
  return value == null && typeof value == 'undefined'
}

/**
 * @description 树转数组，队列实现广度优先遍历
 * @param {Array} data  数据
 * @param {Object} props `{ children: 'children' }`
 */

export const treeToArray = (data: any[], props = { children: 'children' }) => {
  data = cloneDeep(data)
  const { children } = props
  const newData = []
  const queue: any[] = []
  data.forEach((child: any) => queue.push(child))
  while (queue.length) {
    const item: any = queue.shift()
    if (item[children]) {
      item[children].forEach((child: any) => queue.push(child))
      delete item[children]
    }
    newData.push(item)
  }
  return newData
}

/**
 * @description 数组转
 * @param {Array} data  数据
 * @param {Object} props `{ parent: 'pid', children: 'children' }`
 */

export const arrayToTree = (
  data: any[],
  props = { id: 'id', parentId: 'pid', children: 'children' }
) => {
  data = cloneDeep(data)
  const { id, parentId, children } = props
  const result: any[] = []
  const map = new Map()
  data.forEach((item) => {
    map.set(item[id], item)
    const parent = map.get(item[parentId])
    if (parent) {
      parent[children] = parent[children] ?? []
      parent[children].push(item)
    } else {
      result.push(item)
    }
  })
  return result
}

/**
 * @description 获取正确的路经
 * @param {String} path  数据
 */
export function getNormalPath(path: string) {
  if (path.length === 0 || !path || path == 'undefined') {
    return path
  }
  const newPath = path.replace('//', '/')
  const length = newPath.length
  if (newPath[length - 1] === '/') {
    return newPath.slice(0, length - 1)
  }
  return newPath
}

/**
 * @description对象格式化为Query语法
 * @param { Object } params
 * @return {string} Query语法
 */
export function objectToQuery(params: Record<string, any>): string {
  let query = ''
  for (const props of Object.keys(params)) {
    const value = params[props]
    const part = encodeURIComponent(props) + '='
    if (!isEmpty(value)) {
      if (isObject(value)) {
        for (const key of Object.keys(value)) {
          if (!isEmpty(value[key])) {
            const params = props + '[' + key + ']'
            const subPart = encodeURIComponent(params) + '='
            query += subPart + encodeURIComponent(value[key]) + '&'
          }
        }
      } else {
        query += part + encodeURIComponent(value) + '&'
      }
    }
  }
  return query.slice(0, -1)
}

/**
 * @description 时间格式化
 * @param dateTime { number } 时间戳
 * @param fmt { string } 时间格式
 * @return { string }
 */
// yyyy:mm:dd|yyyy:mm|yyyy年mm月dd日|yyyy年mm月dd日 hh时MM分等,可自定义组合
export const timeFormat = (dateTime: number, fmt = 'yyyy-mm-dd') => {
  // 如果为null,则格式化当前时间
  if (!dateTime) {
    dateTime = Number(new Date())
  }
  // 如果dateTime长度为10或者13，则为秒和毫秒的时间戳，如果超过13位，则为其他的时间格式
  if (dateTime.toString().length == 10) {
    dateTime *= 1000
  }
  const date = new Date(dateTime)
  let ret
  const opt: any = {
    'y+': date.getFullYear().toString(), // 年
    'm+': (date.getMonth() + 1).toString(), // 月
    'd+': date.getDate().toString(), // 日
    'h+': date.getHours().toString(), // 时
    'M+': date.getMinutes().toString(), // 分
    's+': date.getSeconds().toString() // 秒
  }
  for (const k in opt) {
    ret = new RegExp('(' + k + ')').exec(fmt)
    if (ret) {
      fmt = fmt.replace(
        ret[1],
        ret[1].length == 1 ? opt[k] : opt[k].padStart(ret[1].length, '0')
      )
    }
  }
  return fmt
}

/**
 * @description 获取不重复的id
 * @param length { Number } id的长度
 * @return { String } id
 */
export const getNonDuplicateID = (length = 8) => {
  let idStr = Date.now().toString(36)
  idStr += Math.random().toString(36).substring(3, length)
  return idStr
}

/**
 * 获取列表中指定的值
 * @param list
 * @param search
 * @param returnKey
 * @param searchKey
 */
export const arrayValue = (
  list: Array<any>,
  search: any = '',
  returnKey = 'label',
  searchKey = 'value'
) => {
  if (!search) {
    return ''
  }

  let item
  for (item of list) {
    if (search === (item[searchKey] ?? '')) {
      return item[returnKey] ?? ''
    }
  }

  return false
}

// 判断arr是否为一个数组，返回一个bool值
export function isArray (arr: any) {
  return Object.prototype.toString.call(arr) === '[object Array]';
}

// 深度克隆
export function deepClone (obj: any) {
  // 对常见的“非”值，直接返回原来值
  if([null, undefined, NaN, false].includes(obj)) return obj;
  if(typeof obj !== "object" && typeof obj !== 'function') {
    //原始类型直接返回
    return obj;
  }
  const o = isArray(obj) ? [] : {};
  for(const i in obj) {
    if(obj.hasOwnProperty(i)){
      //@ts-ignore
      o[i] = typeof obj[i] === "object" ? deepClone(obj[i]) : obj[i];
    }
  }
  return o;
}

/**
 * 列表取某一列转数组
 * @param array
 * @param field
 */
export function arrayColumn(array: any[], field: string) {
  return array.map((v) => v[field])
}

/**
 * 数字金额转大写
 * @param n
 */
export function digitUppercase(n: any) {
  let i;
  const fraction = ['角', '分'];
  const digit = [
    '零', '壹', '贰', '叁', '肆',
    '伍', '陆', '柒', '捌', '玖'
  ];
  const unit = [
    ['元', '万', '亿'],
    ['', '拾', '佰', '仟']
  ];
  const head = n < 0 ? '欠' : '';
  n = Math.abs(n);
  let s = '';
  for (i = 0; i < fraction.length; i++) {
    s += (digit[Math.floor(n * 10 * Math.pow(10, i)) % 10] + fraction[i]).replace(/零./, '');
  }
  s = s || '整';
  n = Math.floor(n);
  for (i = 0; i < unit[0].length && n > 0; i++) {
    let p = '';
    for (let j = 0; j < unit[1].length && n > 0; j++) {
      p = digit[n % 10] + unit[1][j] + p;
      n = Math.floor(n / 10);
    }
    s = p.replace(/(零.)*零$/, '').replace(/^$/, '零') + unit[0][i] + s;
  }
  return head + s.replace(/(零.)*零元/, '元')
    .replace(/(零.)+/g, '零')
    .replace(/^整$/, '零元整');
};

export function debounce(fn, delay = 300, immediate = false) {
  let timer = null;

  return function (...args) {
    const context = this;

    if (timer) clearTimeout(timer);

    if (immediate && !timer) {
      fn.apply(context, args); // 第一次立即执行
    }

    timer = setTimeout(() => {
      if (!immediate) fn.apply(context, args);
      timer = null; // 清理，确保下一次还能立即执行
    }, delay);
  };
}
