// ✅ FULL IMAGE UPDATE FIX — Cover & Additional images now handled same as AddProduct

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  Image,
} from "react-bootstrap";
import Link from "next/link";
import { postApiWithFile, postApi, updateApiWithFile } from "services/api";
import { config } from "services/config";
import Select from "react-select";
// top of file
import Swal from "sweetalert2";

// Numeric fields that should accept decimals (support both "." and "," while typing)
const DECIMAL_FIELDS = new Set([
  "height",
  "width",
  "length",
  "weight",
  "cost",
  "price",
  "mrp",
]);

// Numeric fields that should remain whole numbers
const INTEGER_FIELDS = new Set(["stock", "minOrderQuantity", "maxOrderQuantity"]);

export default function EditProduct({ params }) {
  const router = useRouter();
  const productId = params.editid;
// inside EditProduct
const [errors, setErrors] = useState({});
const [loading, setLoading] = useState(false);

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [brands, setBrands] = useState([]);
 
  const [productType, setProductType] = useState([]);

  const [existingCoverImage, setExistingCoverImage] = useState(null);
  const [existingAdditionalImages, setExistingAdditionalImages] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);

  const [formData, setFormData] = useState({
    id: productId,
    productName: "",
    brand: "",
    category: "",
    subCategory: "",
    sku_id: "",
    itemType: "",
    price: 0,
    width:0,
    length:0,
    height:0,
    weight: 0,
    minOrderQuantity: 0,
    maxOrderQuantity: 0,
    product_description: "",
 ingredients: "",
    cost:0,
    mrp:0,
    coverImage: null,
    additionalImages: [],
    stock: "",
    inventory_status: 0,
     is_show: false,
  // buy_one_get_one: false,
  });

  const taxSlabs = [
    { id: 1, name: "5%" },
    { id: 2, name: "12%" },
    { id: 3, name: "18%" },
    { id: 4, name: "28%" },
  ];

  useEffect(() => {
    if (productId) {
      fetchCategories();
      fetchBrands();
    
      fetchProductType();
      fetchProduct();
    }
  }, [productId]);

  const fetchCategories = async () => {
    const response = await postApi(config.category, {
      dropdown_type: "category",
      page: 1,
      pageSize: 1000,
    });
    setCategories(response.result);
  };

  const fetchBrands = async () => {
    const response = await postApi(config.category, {
      dropdown_type: "brand",
      page: 1,
      pageSize: 1000,
    });
    setBrands(response.result);
  };


  const fetchProductType = async () => {
    const response = await postApi(config.category, {
      dropdown_type: "product_type",
      page: 1,
      pageSize: 1000,
    });
    setProductType(response.result);
  };

  const fetchSubCategories = async (category_id) => {
    const response = await postApi(config.Getsubcategory, { category_id });
    setSubCategories(response.data);
  };

  const fetchProduct = async () => {
    const response = await postApi(config.Viewproduct, { id: productId });
    console.log("responde coming from api ", response);
    if (response.statusCode === 201) {
       setFormData({
    ...response.product,
    subCategory: response.product.subcategory || "",
    ingredients: response.product.ingredients || "",
    coverImage: null,
    additionalImages: [],
    is_show: response.product.is_show || false, // ✅ NEW
  });

      if (response.product.category) {
        fetchSubCategories(response.product.category); // ✅ Preload subcategories based on saved category
      }

      setExistingCoverImage(response.product.coverImage);
      setExistingAdditionalImages(response.product.additionalImages || []);
      
    }
  };

  const handleCategoryChange = (e) => {
    const selectedCategory = e.target.value;
    fetchSubCategories(selectedCategory);
    setFormData({ ...formData, category: selectedCategory, subCategory: "" });
    console.log("formdata", formData);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Allow reliable decimal typing across locales by handling decimal fields as strings.
    // - Accept digits, one decimal separator ("." or ","), and intermediate states like "12."
    // - Normalize "," to "." in state for consistent parsing later
    if (DECIMAL_FIELDS.has(name)) {
      const cleaned = String(value).replace(/\s+/g, "").replace(",", ".");
      if (cleaned === "") {
        setFormData((prev) => ({ ...prev, [name]: "" }));
        return;
      }
      if (cleaned.startsWith("-")) return;
      // valid: "12", "12.", "12.5", ".5"
      if (!/^(\d+(\.\d*)?|\.\d+)$/.test(cleaned)) return;
      setFormData((prev) => ({ ...prev, [name]: cleaned }));
      return;
    }

    // Whole-number-only fields
    if (INTEGER_FIELDS.has(name)) {
      const cleaned = String(value).replace(/\s+/g, "");
      if (cleaned === "") {
        setFormData((prev) => ({ ...prev, [name]: "" }));
        return;
      }
      if (!/^\d+$/.test(cleaned)) return;
      setFormData((prev) => ({ ...prev, [name]: cleaned }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, coverImage: file });
      setPreviewImage(URL.createObjectURL(file));
      setExistingCoverImage(null);
    }
  };

  const handleAdditionalImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({
      ...prev,
      additionalImages: [...prev.additionalImages, ...files],
    }));
  };
  const removeNewAdditionalImage = (index) => {
    const updatedNewImages = [...formData.additionalImages];
    updatedNewImages.splice(index, 1);
    setFormData((prev) => ({
      ...prev,
      additionalImages: updatedNewImages,
    }));
  };

const removeExistingAdditionalImage = async (index) => {
  const result = await Swal.fire({
    title: "Delete this image?",
    text: "This action is irreversible.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete",
    cancelButtonText: "Cancel",
    reverseButtons: true,
  });

  if (!result.isConfirmed) return;

  const fullPath = existingAdditionalImages[index];
  const imageName = fullPath.replace(/^uploads[\\/]+images[\\/]+/, "");

  // Optimistic UI
  const updatedImages = [...existingAdditionalImages];
  updatedImages.splice(index, 1);
  setExistingAdditionalImages(updatedImages);

  try {
    const response = await deleteImageApi(imageName, productId);
    if (response?.statusCode !== 200) {
      // rollback on failure
      setExistingAdditionalImages((prev) => {
        const rollback = [...prev];
        rollback.splice(index, 0, fullPath);
        return rollback;
      });

      await Swal.fire({
        title: "Failed",
        text: response?.message || "Failed to delete image.",
        icon: "error",
      });
    } else {
      await Swal.fire({
        title: "Deleted",
        text: "Image deleted successfully.",
        icon: "success",
        timer: 1200,
        showConfirmButton: false,
      });
    }
  } catch (error) {
    // rollback on error
    setExistingAdditionalImages((prev) => {
      const rollback = [...prev];
      rollback.splice(index, 0, fullPath);
      return rollback;
    });

    await Swal.fire({
      title: "Error",
      text: "Something went wrong while deleting the image.",
      icon: "error",
    });
  }
};


 const deleteImageApi = async (imageName, productId) => {
  try {
    const response = await postApi(config.DeleteProductImage, { imageName, productId });
    return response;
  } catch (error) {
    throw error;
  }
};


  const validateForm = () => {
  const newErrors = {};
  if (!formData.productName?.trim()) newErrors.productName = "Product Name is required.";
  if (!formData.sku_id?.trim()) newErrors.sku_id = "SKU ID is required.";
  if (!formData.brand) newErrors.brand = "Brand is required.";
  if (!formData.category) newErrors.category = "Category is required.";
  if (!formData.subCategory) newErrors.subCategory = "Sub-category is required.";
  if (!formData.price || parseFloat(formData.price) <= 0) {
   newErrors.price = "Price must be greater than 0.";
 }
 if (!formData.weight || parseFloat(formData.weight) <= 0) {
   newErrors.weight = "Weight must be greater than 0.";
 }
  if (!formData.minOrderQuantity || parseInt(formData.minOrderQuantity) <= 0) {
   newErrors.minOrderQuantity = "Min. Order must be greater than 0.";
 }
  if (!formData.maxOrderQuantity || parseInt(formData.maxOrderQuantity) <= 0) {
  newErrors.maxOrderQuantity = "Max. Order must be greater than 0.";
 }
  if (!formData.product_description) newErrors.product_description = "Product Description is required.";
 if (!formData.stock || parseInt(formData.stock) <= 0) {
   newErrors.stock = "Stock must be greater than 0.";
 }

  if (!formData.mrp || parseFloat(formData.mrp) <= 0) {
   newErrors.mrp = "MRP must be greater than 0.";
 }
 if (!formData.height || parseFloat(formData.height) <= 0) {
   newErrors.height = "Height must be greater than 0.";
 }
 if (!formData.width || parseFloat(formData.width) <= 0) {
   newErrors.width = "Width must be greater than 0.";
 }
  if (!formData.length || parseFloat(formData.length) <= 0) {
   newErrors.length = "Length must be greater than 0.";
 }
 if (!formData.cost || parseFloat(formData.cost) <= 0) {
   newErrors.cost = "Cost must be greater than 0.";
 }
  if (!formData.itemType) newErrors.itemType = "Item Type is required.";

// Require cover image (new OR existing)
 if (!formData.coverImage && !existingCoverImage) {
   newErrors.coverImage = "Cover image is required.";
 }

 // Require at least one additional image (new OR existing)
 if (
   (!formData.additionalImages || formData.additionalImages.length === 0) &&
   (!existingAdditionalImages || existingAdditionalImages.length === 0)
 ) {
   newErrors.additionalImages = "At least one additional image is required.";
 }
 
  // RULE: Cost <= Price
  if (parseFloat(formData.cost) > parseFloat(formData.price)) {
    newErrors.cost = "Cost cannot be greater than Price.";
  }

  // RULE: MRP >= Price
  if (parseFloat(formData.mrp) < parseFloat(formData.price)) {
    newErrors.mrp = "MRP cannot be less than Price.";
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

const renderError = (field) =>
  errors[field] && (
    <div style={{ color: "red", fontSize: "0.9em" }}>{errors[field]}</div>
  );


const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  if (formData.stock > 0) {
  formData.inventory_status = 1;
}
console.log("aya")
  setLoading(true);

 
  const data = { ...formData, existingAdditionalImages };

  // Convert numeric fields (preserve decimals where applicable)
  const numericKeys = [
    "price",
    "cost",
    "mrp",
    "weight",
    "height",
    "width",
    "length",
    "stock",
    "minOrderQuantity",
    "maxOrderQuantity",
  ];
  numericKeys.forEach((k) => {
    data[k] =
      data[k] === "" || data[k] === null || data[k] === undefined
        ? 0
        : Number(data[k]);
  });

  delete data.additionalImages;
  delete data.coverImage;
  delete data.modified;

  const files = {};
  if (formData.coverImage) files.coverImage = formData.coverImage;
  if (formData.additionalImages.length > 0) files.additionalImages = formData.additionalImages;

  try {
    const response = await postApiWithFile(
      `${config.Updateproduct}/${productId}`,
      data,
      files
    );

    if (response.statusCode === 200) {
      router.push("/admin/inventory");
    } else {
      alert("Failed to update product.");
    }
  } catch (error) {
    alert("Error updating product.");
  } finally {
    setLoading(false);
  }
};




  return (
    <Container fluid>
      <Row>
        <Col>
          <Card className="p-4 mt-4">
            <Card.Body>
              <Row className="mb-3">
                <Col>
                  <h2>Edit Product</h2>
                </Col>
                <Col className="d-flex justify-content-end">
                  <Link href={"/admin/inventory"}>
                    <Button variant="danger">Back</Button>
                  </Link>
                </Col>
              </Row>
              <Form onSubmit={handleSubmit} noValidate>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Product Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="productName"
                        value={formData.productName}
                        onChange={handleInputChange}
                      />
                       {renderError("productName")}
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>SKU Id</Form.Label>
                      <Form.Control
                        type="text"
                        name="sku_id"
                        value={formData.sku_id}
                        onChange={handleInputChange}
                      />
                       {renderError("sku_id")}
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Brand</Form.Label>
                      <Form.Select
                        name="brand"
                        value={formData.brand}
                        onChange={handleInputChange}
                      >
                        {brands.map((brand, index) => (
                          <option key={index} value={brand._id} title={brand.name}>
                             {brand.name.length > 25
    ? brand.name.slice(0, 25) + "..."
    : brand.name}
                          </option>
                        ))}
                      </Form.Select>
                       {renderError("brand")}
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Category</Form.Label>
                      <Form.Select
                        name="category"
                        value={formData.category}
                        onChange={handleCategoryChange}
                      >
                        {categories.map((category, index) => (
                          <option key={index} value={category._id}>
                            {category.name}
                          </option>
                        ))}
                      </Form.Select>
                        {renderError("category")}
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Sub-Category</Form.Label>
                      <Form.Select
                       name="subCategory"
                       value={formData.subCategory}
                        onChange={handleInputChange}
                      >
                        <option value={""}>Select Sub-Category</option>
                        {subCategories.map((sub, index) => (
                          <option key={index} value={sub._id}>
                            {sub.name}
                          </option>
                        ))}
                      </Form.Select>
                         {renderError("subCategory")}
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Displayed Price</Form.Label>
                      <Form.Control
                        type="text"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        inputMode="decimal"
                      />
                      
                   {renderError("price")}
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Weight (g)</Form.Label>
                      <Form.Control
                        type="text"
                        name="weight"
                        value={formData.weight}
                        onChange={handleInputChange}
                        inputMode="decimal"
                      />
                      {renderError("weight")}
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Item Type</Form.Label>
                      <Form.Select
                        name="itemType"
                        value={formData.itemType || ""}
                        onChange={handleInputChange}
                      >
                          <option value={''} disabled>Select Value </option>
                        {productType.map((type, index) => (<>
                          <option key={index} value={type._id}>
                            {type.name}
                          </option>
                       </> ))}
                      </Form.Select>
                        {renderError("itemType")}
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Min Order Qty</Form.Label>
                      <Form.Control
                        type="number"
                        name="minOrderQuantity"
                        value={formData.minOrderQuantity}
                        onChange={handleInputChange}
                         onWheel={(e) => e.target.blur()}
                        min="1"
                      />
                       {renderError("minOrderQuantity")}
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Max Order Qty</Form.Label>
                      <Form.Control
                        type="number"
                        name="maxOrderQuantity"
                        value={formData.maxOrderQuantity}
                        onChange={handleInputChange}
                         onWheel={(e) => e.target.blur()}
                        min="1"
                      />
                        {renderError("maxOrderQuantity")}
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Product Description</Form.Label>
                      <Form.Control
                        as="textarea"
                        name="product_description"
                        rows={3}
                        value={formData.product_description}
                        onChange={handleInputChange}
                      />
                       {renderError("product_description")}
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                 <Form.Group className="mb-3">
  <Form.Label>Ingredients </Form.Label>
  <Form.Control
    type="text"
    name="ingredients"
    placeholder="Enter ingredients (comma-separated)"
    value={formData.ingredients}
    onChange={handleInputChange}
  />
  
</Form.Group>

                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Stock</Form.Label>
                      <Form.Control
                        type="number"
                        name="stock"
                        value={formData?.stock}
                        onChange={handleInputChange}
                         onWheel={(e) => e.target.blur()}
                        min="1"
                      />
                       {renderError("stock")}
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Cost To Company </Form.Label>
                      <Form.Control
                        type="text"
                        name="cost"
                        value={formData.cost}
                        onChange={handleInputChange}
                        inputMode="decimal"
                      />
                      {renderError("cost")}
                    </Form.Group>
                  </Col>
                
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Width (in cm)</Form.Label>
                      <Form.Control
                        type="text"
                        name="width"
                        value={formData?.width}
                        onChange={handleInputChange}
                        inputMode="decimal"
                      />
                      {renderError("width")}
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Height (in cm)</Form.Label>
                      <Form.Control
                        type="text"
                        name="height"
                        value={formData.height}
                        onChange={handleInputChange}
                        inputMode="decimal"
                      />
                      {renderError("height")}
                    </Form.Group>
                  </Col>
                
                </Row>
                <Row>
                <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>length (in cm)</Form.Label>
                      <Form.Control
                        type="text"
                        name="length"
                        value={formData.length}
                        onChange={handleInputChange}
                        inputMode="decimal"
                      />
                      {renderError("length")}
                    </Form.Group>
                  </Col>
                  </Row>
                <Row>
                <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>MRP</Form.Label>
                      <Form.Control
                        type="text"
                        name="mrp"
                        value={formData.mrp}
                        onChange={handleInputChange}
                        inputMode="decimal"
                      />
                      {renderError("mrp")}
                    </Form.Group>
                  </Col>
                  </Row>
                <Row>
                <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Cover Image
                        (Preferred Image 114W × 100H (Aspect ratio) and less than 10MB  of  Jpeg,Png type ) 
                      </Form.Label>
                      <Form.Control
                        type="file"
                        accept="image/*"
                        onChange={handleCoverImageChange}
                      />
                      {previewImage && (
                        <img
                          src={previewImage}
                          alt="Preview"
                          style={{ width: "150px", marginTop: "10px" }}
                        />
                      )}{" "}
                      {existingCoverImage && (
                        <img
                          src={`${process.env.NEXT_PUBLIC_API_URL}/${existingCoverImage}`}
                          alt="Existing cover"
                          thumbnail
                          style={{ width: "150px", marginTop: "10px" }}
                        />
                      )}{" "}
                    </Form.Group>
                  </Col>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Additional Images
                        (Preferred Image 114W × 100H (Aspect ratio) and less than 10MB  of  Jpeg,Png type ) 
                      </Form.Label>
                      <Form.Control
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleAdditionalImagesChange}
                      />
                      {renderError("additionalImages")}
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  {/* Existing Images */}
                  {existingAdditionalImages.map((img, idx) => (
                    <Col
                      key={idx}
                      xs={4}
                      md={2}
                      className="mb-2 position-relative"
                    >
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL}/${img}`}
                        alt={`Existing additional ${idx + 1}`}
                        thumbnail
                        style={{ height: "100px", width: "100px" }}
                      />
                      <Button
                        variant="danger"
                        size="sm"
                        style={{ position: "absolute",  }}
                        onClick={() => removeExistingAdditionalImage(idx)}
                      >
                        X
                      </Button>
                    </Col>
                  ))}

                  {/* New Selected Images */}
                  {/* ✅ New selected images with remove option */}
                  {formData.additionalImages.map((img, idx) => (
                    <Col
                      key={`new-${idx}`}
                      xs={4}
                      md={2}
                      className="mb-2 position-relative"
                    >
                      <img
                        src={URL.createObjectURL(img)}
                        alt={`New additional ${idx + 1}`}
                        thumbnail
                        style={{ height: "100px", width: "100px" }}
                      />
                      <Button
                        variant="danger"
                        size="sm"
                        style={{ position: "absolute", }}
                        onClick={() => removeNewAdditionalImage(idx)}
                      >
                        X
                      </Button>
                    </Col>
                  ))}
                </Row>

                {/* <Form.Group className="mb-3">
  <Form.Check
    type="checkbox"
    label="Buy One Get One Free"
    checked={formData.buy_one_get_one}
    onChange={(e) =>
      setFormData({
        ...formData,
        buy_one_get_one: e.target.checked,
      })
    }
  />

</Form.Group> */}

<Form.Group className="mb-3">
  <Form.Check
    type="checkbox"
    label="Show on Landing Page"
    checked={formData.is_show}
    onChange={(e) =>
      setFormData({
        ...formData,
        is_show: e.target.checked,
      })
    }
  />
</Form.Group>

               <Button type="submit" variant="primary" disabled={loading}>
   {loading ? "Updating..." : "Update Product"}
 </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
