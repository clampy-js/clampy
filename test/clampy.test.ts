import * as clampy from '../src/clampy';


describe('Clampy dummy test', () => {

  it('Clampy returns clamped element', () => {
    const element = document.createElement('div');
    element.innerHTML = 'toto';
    expect(clampy.clamp(element).original).toEqual('toto');
  })
})
