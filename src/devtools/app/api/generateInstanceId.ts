/* eslint-disable */
// @ts-nocheck

let id = 0;

export default function generateId(instanceId) {
  return instanceId || ++id;
}
