import { Component } from 'ng-forward';
import { providers, TestComponentBuilder } from 'ng-forward/testing';
import { AdminModalComponent } from '../app/scripts/components/admin/admin.modal/admin.modal.component';
import sinon from 'sinon';
import 'reflect-metadata';

@Component({
  selector: 'test-cmp',
  template: '<div></div>'
})

class Test {}

describe('MainComponent', () => {
  let component, tcb, html;
  tcb = new TestComponentBuilder();
  }));

  it('successfully compiles', (done) => {
    html = '<rose-st-admin></rose-st-admin>';
    tcb.overrideTemplate(Test, html)
      .createAsync(Test).then(fixture => {
        let MainComponent = fixture.debugElement.componentViewChildren[0];
        expect(MainComponent).toBeDefined();
        done();
      })
  });
});
