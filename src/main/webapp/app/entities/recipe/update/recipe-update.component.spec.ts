jest.mock('@angular/router');

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of, Subject } from 'rxjs';

import { RecipeService } from '../service/recipe.service';
import { IRecipe, Recipe } from '../recipe.model';
import { IIngredient } from 'app/entities/ingredient/ingredient.model';
import { IngredientService } from 'app/entities/ingredient/service/ingredient.service';

import { RecipeUpdateComponent } from './recipe-update.component';

describe('Component Tests', () => {
  describe('Recipe Management Update Component', () => {
    let comp: RecipeUpdateComponent;
    let fixture: ComponentFixture<RecipeUpdateComponent>;
    let activatedRoute: ActivatedRoute;
    let recipeService: RecipeService;
    let ingredientService: IngredientService;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        declarations: [RecipeUpdateComponent],
        providers: [FormBuilder, ActivatedRoute],
      })
        .overrideTemplate(RecipeUpdateComponent, '')
        .compileComponents();

      fixture = TestBed.createComponent(RecipeUpdateComponent);
      activatedRoute = TestBed.inject(ActivatedRoute);
      recipeService = TestBed.inject(RecipeService);
      ingredientService = TestBed.inject(IngredientService);

      comp = fixture.componentInstance;
    });

    describe('ngOnInit', () => {
      it('Should call Ingredient query and add missing value', () => {
        const recipe: IRecipe = { id: 456 };
        const ingredients: IIngredient[] = [{ id: 21284 }];
        recipe.ingredients = ingredients;

        const ingredientCollection: IIngredient[] = [{ id: 18551 }];
        spyOn(ingredientService, 'query').and.returnValue(of(new HttpResponse({ body: ingredientCollection })));
        const additionalIngredients = [...ingredients];
        const expectedCollection: IIngredient[] = [...additionalIngredients, ...ingredientCollection];
        spyOn(ingredientService, 'addIngredientToCollectionIfMissing').and.returnValue(expectedCollection);

        activatedRoute.data = of({ recipe });
        comp.ngOnInit();

        expect(ingredientService.query).toHaveBeenCalled();
        expect(ingredientService.addIngredientToCollectionIfMissing).toHaveBeenCalledWith(ingredientCollection, ...additionalIngredients);
        expect(comp.ingredientsSharedCollection).toEqual(expectedCollection);
      });

      it('Should update editForm', () => {
        const recipe: IRecipe = { id: 456 };
        const ingredients: IIngredient = { id: 2798 };
        recipe.ingredients = [ingredients];

        activatedRoute.data = of({ recipe });
        comp.ngOnInit();

        expect(comp.editForm.value).toEqual(expect.objectContaining(recipe));
        expect(comp.ingredientsSharedCollection).toContain(ingredients);
      });
    });

    describe('save', () => {
      it('Should call update service on save for existing entity', () => {
        // GIVEN
        const saveSubject = new Subject();
        const recipe = { id: 123 };
        spyOn(recipeService, 'update').and.returnValue(saveSubject);
        spyOn(comp, 'previousState');
        activatedRoute.data = of({ recipe });
        comp.ngOnInit();

        // WHEN
        comp.save();
        expect(comp.isSaving).toEqual(true);
        saveSubject.next(new HttpResponse({ body: recipe }));
        saveSubject.complete();

        // THEN
        expect(comp.previousState).toHaveBeenCalled();
        expect(recipeService.update).toHaveBeenCalledWith(recipe);
        expect(comp.isSaving).toEqual(false);
      });

      it('Should call create service on save for new entity', () => {
        // GIVEN
        const saveSubject = new Subject();
        const recipe = new Recipe();
        spyOn(recipeService, 'create').and.returnValue(saveSubject);
        spyOn(comp, 'previousState');
        activatedRoute.data = of({ recipe });
        comp.ngOnInit();

        // WHEN
        comp.save();
        expect(comp.isSaving).toEqual(true);
        saveSubject.next(new HttpResponse({ body: recipe }));
        saveSubject.complete();

        // THEN
        expect(recipeService.create).toHaveBeenCalledWith(recipe);
        expect(comp.isSaving).toEqual(false);
        expect(comp.previousState).toHaveBeenCalled();
      });

      it('Should set isSaving to false on error', () => {
        // GIVEN
        const saveSubject = new Subject();
        const recipe = { id: 123 };
        spyOn(recipeService, 'update').and.returnValue(saveSubject);
        spyOn(comp, 'previousState');
        activatedRoute.data = of({ recipe });
        comp.ngOnInit();

        // WHEN
        comp.save();
        expect(comp.isSaving).toEqual(true);
        saveSubject.error('This is an error!');

        // THEN
        expect(recipeService.update).toHaveBeenCalledWith(recipe);
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

    describe('Getting selected relationships', () => {
      describe('getSelectedIngredient', () => {
        it('Should return option if no Ingredient is selected', () => {
          const option = { id: 123 };
          const result = comp.getSelectedIngredient(option);
          expect(result === option).toEqual(true);
        });

        it('Should return selected Ingredient for according option', () => {
          const option = { id: 123 };
          const selected = { id: 123 };
          const selected2 = { id: 456 };
          const result = comp.getSelectedIngredient(option, [selected2, selected]);
          expect(result === selected).toEqual(true);
          expect(result === selected2).toEqual(false);
          expect(result === option).toEqual(false);
        });

        it('Should return option if this Ingredient is not selected', () => {
          const option = { id: 123 };
          const selected = { id: 456 };
          const result = comp.getSelectedIngredient(option, [selected]);
          expect(result === option).toEqual(true);
          expect(result === selected).toEqual(false);
        });
      });
    });
  });
});
