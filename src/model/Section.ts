//
// /**
//  * Created by Sean on 10/1/16.
//  */
//
// export default class Course {
//
//     //identified by:
//     private _uniqueId: number;
//
//     //course info:
//     private _dept: string;
//     private _id: string;
//     private _title: string;
//
//     //section info:
//     private _avg: number;
//     private _instructor: string[];
//     private _pass: number;
//     private _fail: number;
//     private _audit: number;
//
//
//     constructor(uniqueId: number, dept: string, id: string, title: string, avg: number, instructor: string[],
//                     pass: number, fail: number, audit: number) {
//         this._uniqueId = uniqueId;
//         this._dept = dept;
//         this._id = id;
//         this._title = title;
//         this._avg = avg;
//         this._instructor = instructor;
//         this._pass = pass;
//         this._fail = fail;
//         this._audit = audit;
//     }
//
//     get uniqueId(): number {
//         return this._uniqueId;
//     }
//
//     public getField (field: string): number|string|string[] {
//         switch (field) {
//             case "uniqueID":
//                 return this._uniqueId;
//             case "dept":
//                 return this._dept;
//             case "id":
//                 return this._id;
//             case "title":
//                 return this._title;
//             case "avg":
//                 return this._avg;
//             case "instructor":
//                 return this._instructor;
//             case "pass":
//                 return this._pass;
//             case "fail":
//                 return this._fail;
//             case "audit":
//                 return this._audit;
//             default:
//                 //
//         }
//     }
// }