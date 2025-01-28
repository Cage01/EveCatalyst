var expect;
import('chai').then(chai => { expect = chai.expect; });

describe('Application Tests', () => {
    it('should return true for true', () => {
        expect(true).to.be.true;
    });
    
    it('should return 2 for 1 + 1', () => {
        expect(1 + 1).to.equal(2);
    });
});