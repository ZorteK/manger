jest.mock('@angular/router');

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of, Subject } from 'rxjs';

import { StockService } from '../service/stock.service';
import { IStock, Stock } from '../stock.model';
import { IIngredient } from 'app/entities/ingredient/ingredient.model';
import { IngredientService } from 'app/entities/ingredient/service/ingredient.service';

import { StockUpdateComponent } from './stock-update.component';

describe('Component Tests', () => {
  describe('Stock Management Update Component', () => {
    let comp: StockUpdateComponent;
    let fixture: ComponentFixture<StockUpdateComponent>;
    let activatedRoute: ActivatedRoute;
    let stockService: StockService;
    let ingredientService: IngredientService;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        declarations: [StockUpdateComponent],
        providers: [FormBuilder, ActivatedRoute],
      })
        .overrideTemplate(StockUpdateComponent, '')
        .compileComponents();

      fixture = TestBed.createComponent(StockUpdateComponent);
      activatedRoute = TestBed.inject(ActivatedRoute);
      stockService = TestBed.inject(StockService);
      ingredientService = TestBed.inject(IngredientService);

      comp = fixture.componentInstance;
    });

    describe('ngOnInit', () => {
      it('Should call ingredient query and add missing value', () => {
        const stock: IStock = { id: 456 };
        const ingredient: IIngredient = { id: 92368 };
        stock.ingredient = ingredient;

        const ingredientCollection: IIngredient[] = [{ id: 35804 }];
        spyOn(ingredientService, 'query').and.returnValue(of(new HttpResponse({ body: ingredientCollection })));
        const expectedCollection: IIngredient[] = [ingredient, ...ingredientCollection];
        spyOn(ingredientService, 'addIngredientToCollectionIfMissing').and.returnValue(expectedCollection);

        activatedRoute.data = of({ stock });
        comp.ngOnInit();

        expect(ingredientService.query).toHaveBeenCalled();
        expect(ingredientService.addIngredientToCollectionIfMissing).toHaveBeenCalledWith(ingredientCollection, ingredient);
        expect(comp.ingredientsCollection).toEqual(expectedCollection);
      });

      it('Should update editForm', () => {
        const stock: IStock = { id: 456 };
        const ingredient: IIngredient = { id: 94903 };
        stock.ingredient = ingredient;

        activatedRoute.data = of({ stock });
        comp.ngOnInit();

        expect(comp.editForm.value).toEqual(expect.objectContaining(stock));
        expect(comp.ingredientsCollection).toContain(ingredient);
      });
    });

    describe('save', () => {
      it('Should call update service on save for existing entity', () => {
        // GIVEN
        const saveSubject = new Subject();
        const stock = { id: 123 };
        spyOn(stockService, 'update').and.returnValue(saveSubject);
        spyOn(comp, 'previousState');
        activatedRoute.data = of({ stock });
        comp.ngOnInit();

        // WHEN
        comp.save();
        expect(comp.isSaving).toEqual(true);
        saveSubject.next(new HttpResponse({ body: stock }));
        saveSubject.complete();

        // THEN
        expect(comp.previousState).toHaveBeenCalled();
        expect(stockService.update).toHaveBeenCalledWith(stock);
        expect(comp.isSaving).toEqual(false);
      });

      it('Should call create service on save for new entity', () => {
        // GIVEN
        const saveSubject = new Subject();
        const stock = new Stock();
        spyOn(stockService, 'create').and.returnValue(saveSubject);
        spyOn(comp, 'previousState');
        activatedRoute.data = of({ stock });
        comp.ngOnInit();

        // WHEN
        comp.save();
        expect(comp.isSaving).toEqual(true);
        saveSubject.next(new HttpResponse({ body: stock }));
        saveSubject.complete();

        // THEN
        expect(stockService.create).toHaveBeenCalledWith(stock);
        expect(comp.isSaving).toEqual(false);
        expect(comp.previousState).toHaveBeenCalled();
      });

      it('Should set isSaving to false on error', () => {
        // GIVEN
        const saveSubject = new Subject();
        const stock = { id: 123 };
        spyOn(stockService, 'update').and.returnValue(saveSubject);
        spyOn(comp, 'previousState');
        activatedRoute.data = of({ stock });
        comp.ngOnInit();

        // WHEN
        comp.save();
        expect(comp.isSaving).toEqual(true);
        saveSubject.error('This is an error!');

        // THEN
        expect(stockService.update).toHaveBeenCalledWith(stock);
        expect(comp.isSaving).toEqual(false);
        expect(comp.previousState).not.toHaveBeenCalled();
      });
    });

    describe('Tracking relationships identifiers', () => {
      describe('trackIngredientById', () => {
        it('Should return tracked Ingredient primary key', () => {
          const entity = { id: 123 };
          const trackResult = comp.trackIngredientById(0, entity);
          expect(trackResult).toEqual(entity.id);
        });
      });
    });
  });
});
