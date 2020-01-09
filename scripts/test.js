"use strict";
class Wrapper {
    constructor(data) {
        this.aget = () => 'fget: ' + this.data;
        this.data = data;
    }
    fget() { return 'aget: ' + this.data; }
}
function printAfter1Sec(label, dataFunc) {
    setTimeout(() => {
        try {
            console.log(`${label}: ${dataFunc()}`);
        }
        catch (e) {
            console.log(`${label}: error executing...`);
            console.log(e);
        }
    }, 1000);
}
// Test
let a = new Wrapper("abc");
let b = new Wrapper('fake!!');
let { aget, fget } = a;
printAfter1Sec('aget', aget); // aget: abc
printAfter1Sec('fget', fget); // aget: error executing...\n<error>
printAfter1Sec('aget fake', () => { b.aget = a.aget; return b.aget(); }); // aget fake: abc
printAfter1Sec('fget fake', () => { b.fget = a.fget; return b.fget(); }); // fget fake: fake!!
//# sourceMappingURL=test.js.map