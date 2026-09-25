// ✅ All fields validated, error messages displayed in red below fields.
"use client";
import { useState, useEffect } from "react";
import Select from "react-select";
import { useRouter } from "next/navigation";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import Link from "next/link";
import { postApiWithFile, postApi } from "services/api";
import { config } from "services/config";

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

export default function AddProduct() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [productType, setProductType] = useState([]);
const [loading, setLoading] = useState(false);
const [apiError, setApiError] = useState("");
const [coverInputKey, setCoverInputKey] = useState(0);
const [additionalInputKey, setAdditionalInputKey] = useState(0);
const MAX_SIZE_MB = 10;
const MAX_ADDITIONAL = 20;
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  const ingredientOptions = ingredients.map((ingredient) => ({
    value: ingredient._id,
    label: ingredient.name,
    name: ingredient.name,
  }));

  const [formData, setFormData] = useState({
    productName: "",
    brand: "",
    category: "",
    subCategory: "",
    sku_id: "",
    stock: "",
    mrp: "",
    height: 0,
    width: 0,
    length: 0,
    cost: 0,
    itemType: "",
    price: 0,
    weight: 0,
    minOrderQuantity: 0,
    maxOrderQuantity: 0,
    product_description: "",
   ingredients: "",
    coverImage: null,
    additionalImages: [],
    inventory_status: 0,
    is_show: false, // ✅ NEW FIELD
    // buy_one_get_one: false,
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.productName.trim())
      newErrors.productName = "Product Name is required.";
    if (!formData.sku_id.trim()) newErrors.sku_id = "SKU ID is required.";
    if (!formData.brand) newErrors.brand = "Brand is required.";
    if (!formData.category) newErrors.category = "Category is required.";
    if (!formData.subCategory)
      newErrors.subCategory = "Sub-category is required.";
    if (!formData.cost) {
  newErrors.cost = "Cost is required.";
} else if (parseFloat(formData.cost) > parseFloat(formData.price)) {
  newErrors.cost = "Cost cannot be greater than Price.";
}

    if (!formData.price) newErrors.price = "Price is required.";
    if (!formData.weight) newErrors.weight = "Weight is required.";
    if (!formData.minOrderQuantity)
      newErrors.minOrderQuantity = "Min. Order is required.";
    if (!formData.maxOrderQuantity)
      newErrors.maxOrderQuantity = "Max. Order is required.";
    if (!formData.product_description)
      newErrors.product_description = "Product Description is required.";
    if (!formData.stock) newErrors.stock = "Stock is required.";
    if (!formData.mrp) newErrors.mrp = "MRP is required.";
    if (!formData.height) newErrors.height = "Height is required.";
    if (!formData.width) newErrors.width = "Width is required.";
    if (!formData.length) newErrors.length = "length is required.";
    if (!formData.itemType) newErrors.itemType = "Item Type is required.";
   if (!formData.ingredients.trim()) {
  newErrors.ingredients = "Ingredients are required.";
}

    if (!formData.coverImage) {
      newErrors.coverImage = "Cover image is required.";
    }
    if (!formData.additionalImages || formData.additionalImages.length === 0) {
      newErrors.additionalImages = "At least one additional image is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateFiles = (files) => {
  const rejected = [];
  const ok = [];
  files.forEach((f) => {
    const sizeMb = f.size / (1024 * 1024);
    if (sizeMb > MAX_SIZE_MB) {
      rejected.push(`${f.name} is larger than ${MAX_SIZE_MB}MB`);
      return;
    }
    if (!ALLOWED_MIME.includes(f.type)) {
      rejected.push(`${f.name} has unsupported type (${f.type || "unknown"})`);
      return;
    }
    ok.push(f);
  });
  return { ok, rejected };
};

const handleCoverImageChange = (e) => {
  const file = e.target.files?.[0];
  if (!file) {
    setFormData((p) => ({ ...p, coverImage: null }));
    return;
  }
  const { ok, rejected } = validateFiles([file]);
  if (rejected.length) {
    setErrors((prev) => ({ ...prev, coverImage: rejected.join(" | ") }));
    setCoverInputKey((k) => k + 1); // force native input reset
    return;
  }
  setFormData((p) => ({ ...p, coverImage: ok[0] }));
  setErrors((prev) => ({ ...prev, coverImage: "" }));
};


const handleAdditionalImagesChange = (e) => {
  const newFiles = Array.from(e.target.files || []);
  if (!newFiles.length) return;

  const { ok, rejected } = validateFiles(newFiles);
  if (rejected.length) {
    setErrors((prev) => ({ ...prev, additionalImages: rejected.join(" | ") }));
  } else {
    setErrors((prev) => ({ ...prev, additionalImages: "" }));
  }

  setFormData((prev) => {
    const total = prev.additionalImages.length + ok.length;
    if (total > MAX_ADDITIONAL) {
      setErrors((er) => ({
        ...er,
        additionalImages: `You can upload a maximum of ${MAX_ADDITIONAL} images.`,
      }));
      setAdditionalInputKey((k) => k + 1); // reset native input
      return prev;
    }
    
    // ✅ Enhanced deduplication: Create a unique signature for each file
    // Using name, size, lastModified, and type for more accurate detection
    const existingFiles = prev.additionalImages;
    const createFileSignature = (file) => 
      `${file.name}_${file.size}_${file.lastModified}_${file.type}`;
    
    const existingSignatures = new Set(
      existingFiles.map(createFileSignature)
    );
    
    const uniqueNewFiles = ok.filter((newFile) => {
      const signature = createFileSignature(newFile);
      if (existingSignatures.has(signature)) {
        console.warn(`Duplicate file detected and skipped: ${newFile.name}`);
        return false;
      }
      existingSignatures.add(signature);
      return true;
    });

    if (uniqueNewFiles.length < ok.length) {
      const skippedCount = ok.length - uniqueNewFiles.length;
      setErrors((er) => ({
        ...er,
        additionalImages: `${skippedCount} duplicate file(s) were skipped. Please select different images.`,
      }));
    }

    console.log(`Adding ${uniqueNewFiles.length} new unique files. Total: ${prev.additionalImages.length + uniqueNewFiles.length}`);

    return { ...prev, additionalImages: [...prev.additionalImages, ...uniqueNewFiles] };
  });

  // always clear browser's internal FileList to avoid "12 files" ghost state
  // Reset the input value to ensure clean state
  e.target.value = '';
  setAdditionalInputKey((k) => k + 1);
};


const handleRemoveAdditionalImage = (index) => {
  setFormData((prev) => {
    const updated = prev.additionalImages.filter((_, i) => i !== index);
    if (updated.length === 0) {
      setAdditionalInputKey((k) => k + 1); // fully reset input
      setErrors((er) => ({ ...er, additionalImages: "" }));
    }
    return { ...prev, additionalImages: updated };
  });
};

const handleClearAllAdditionalImages = () => {
  setFormData((prev) => ({ ...prev, additionalImages: [] }));
  setAdditionalInputKey((k) => k + 1);
  setErrors((prev) => ({ ...prev, additionalImages: "" }));
};

  useEffect(() => {
    fetchCategories();
    fetchBrands();
    fetchIngredients();
    fetchProductType();
  }, []);

  const fetchCategories = async () => {
    const data = { dropdown_type: "category", page: 1, pageSize: 1000 };
    const res = await postApi(config.category, data);
    setCategories(res.result);
  };

  const fetchBrands = async () => {
    const data = { dropdown_type: "brand", page: 1, pageSize: 1000 };
    const res = await postApi(config.category, data);
    setBrands(res.result);
  };

  const fetchIngredients = async () => {
    const data = { dropdown_type: "ingredients", page: 1, pageSize: 1000 };
    const res = await postApi(config.category, data);
    setIngredients(res.result);
  };

  const fetchProductType = async () => {
    const data = { dropdown_type: "product_type", page: 1, pageSize: 1000 };
    const res = await postApi(config.category, data);
    setProductType(res.result);
  };

  const fetchSubCategories = async (id) => {
    const res = await postApi(config.Getsubcategory, { category_id: id });
    setSubCategories(res.data);
  };

  const handleCategoryChange = (e) => {
    const val = e.target.value;
    setFormData({ ...formData, category: val, subCategory: "" });
    fetchSubCategories(val);
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

    // Default (text/select/etc.)
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    setFormData({
      ...formData,
      images: Array.from(e.target.files),
    });
  };
const ResetForm = () => {
  setFormData({
    productName: "",
    brand: "",
    category: "",
    subCategory: "",
    itemType: "",
    price: 0,
    minOrderQuantity: 0,
    maxOrderQuantity: 0,
    product_description: "",
    ingredients: "",
    coverImage: null,
    additionalImages: [],
    weight: 0,
    sku_id: "",
    stock: "",
    mrp: "",
    height: 0,
    width: 0,
    length: 0,
    cost: 0,
    inventory_status: 0,
    is_show: false,
  });
  setErrors({});
  setCoverInputKey((k) => k + 1);
  setAdditionalInputKey((k) => k + 1);
};

 const handleSubmit = async (e) => {
  e.preventDefault();
  setApiError(""); // reset old error
const numericKeys = [
  'price','cost','mrp','weight','height','width','length',
  'stock','minOrderQuantity','maxOrderQuantity'
];
  if (!validateForm()) return;

  setLoading(true); // 🔥 start loader

  if (formData.stock > 0) formData.inventory_status = 1;
  const data = { ...formData };
  numericKeys.forEach((k) => {
  // keep empty as 0, otherwise convert to Number preserving decimals
  data[k] = data[k] === '' || data[k] === null || data[k] === undefined ? 0 : Number(data[k]);
});

data.inventory_status = data.stock > 0 ? 1 : 0;
  delete data.additionalImages;
  delete data.coverImage;

  // ✅ Final deduplication before sending to backend
  const createFileSignature = (file) => 
    `${file.name}_${file.size}_${file.lastModified}_${file.type}`;
  
  const uniqueAdditionalImages = [];
  const seenSignatures = new Set();
  
  if (formData.additionalImages.length > 0) {
    formData.additionalImages.forEach((file) => {
      const signature = createFileSignature(file);
      if (!seenSignatures.has(signature)) {
        seenSignatures.add(signature);
        uniqueAdditionalImages.push(file);
      } else {
        console.warn(`Removing duplicate file before submission: ${file.name}`);
      }
    });
  }

  const files = {};
  if (uniqueAdditionalImages.length > 0) {
    files.additionalImages = uniqueAdditionalImages;
    console.log(`Sending ${uniqueAdditionalImages.length} unique additional images to backend`);
  }
  if (formData.coverImage) files.coverImage = formData.coverImage;

  try {
    const res = await postApiWithFile(config.Addproduct, data, files);

    if (res.statusCode === 201) {
      setLoading(false);
      router.push("/admin/inventory");
      ResetForm();
    } else {
      setLoading(false);
      setApiError("Something went wrong. Please try again.");
      
    }
  } catch (error) {
    setLoading(false);
    setApiError(error?.response?.data?.message || "Server error occurred.");
  }
};


  const renderError = (field) =>
    errors[field] && (
      <div style={{ color: "red", fontSize: "0.9em" }}>{errors[field]}</div>
    );

  return (
    <Container fluid>
      <Row>
        <Col>
          <Card className="p-4 mt-4">
            <Card.Body>
              <Row className="mb-3">
                <Col>
                  <h2>Add New Product</h2>
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
                      <Form.Label>Product Name *</Form.Label>
                      <Form.Control
                        name="productName"
                        value={formData.productName}
                        onChange={handleInputChange}
                      />
                      {renderError("productName")}
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>SKU ID *</Form.Label>
                      <Form.Control
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
                      <Form.Label>Brand *</Form.Label>
                      <Form.Select
                        name="brand"
                        value={formData.brand}
                        onChange={handleInputChange}
                      >
                        <option>Select Brand</option>
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
                      <Form.Label>Category *</Form.Label>
                      <Form.Select
                        name="category"
                        value={formData.category}
                        onChange={handleCategoryChange}
                      >
                        <option>Select Category</option>
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
                      <Form.Label>Sub-Category *</Form.Label>
                      <Form.Select
                        name="subCategory"
                        value={formData.subCategory}
                        onChange={handleInputChange}
                      >
                        <option>Select Sub-Category</option>
                        {formData.category &&
                          subCategories.map((subCategory, index) => (
                            <option key={index} value={subCategory._id}>
                              {subCategory.name}
                            </option>
                          ))}
                      </Form.Select>
                      {renderError("subCategory")}
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Displayed Price *</Form.Label>
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
                      <Form.Label>Weight (In gms) *</Form.Label>
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
                      <Form.Label>Item Type *</Form.Label>
                      <Form.Select
                        name="itemType"
                        value={formData.itemType}
                        onChange={handleInputChange}
                      >
                        <option>Select Product Type:</option>
                        {productType.map((product, index) => (
                          <option key={index} value={product?._id}>
                            {product?.name}
                          </option>
                        ))}
                      </Form.Select>
                      {renderError("itemType")}
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Min Order Quantity *</Form.Label>
                      <Form.Control
                        type="number"
                        name="minOrderQuantity"
                        value={formData.minOrderQuantity}
                        onChange={handleInputChange}
                        onWheel={(e) => e.target.blur()}
                        min="0"
                      />
                      {renderError("minOrderQuantity")}
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Max Order Quantity *</Form.Label>
                      <Form.Control
                        type="number"
                        name="maxOrderQuantity"
                        value={formData.maxOrderQuantity}
                        onChange={handleInputChange}
                        onWheel={(e) => e.target.blur()}
                        min="0"
                      />
                      {renderError("maxOrderQuantity")}
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Product Description *</Form.Label>
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
  <Form.Label>Ingredients *</Form.Label>
  <Form.Control
    type="text"
    name="ingredients"
    placeholder="Enter ingredients (comma-separated)"
    value={formData.ingredients}
    onChange={handleInputChange}
  />
  {renderError("ingredients")}
</Form.Group>

                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Stock *</Form.Label>
                      <Form.Control
                        type="number"
                        name="stock"
                        value={formData.stock}
                        onChange={handleInputChange}
                        onWheel={(e) => e.target.blur()}
                        min="0"
                      />
                      {renderError("stock")}
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>MRP *</Form.Label>
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
                      <Form.Label>Height (in cm) *</Form.Label>
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
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Width (in cm) *</Form.Label>
                      <Form.Control
  type="text"
  name="width"
  value={formData.width}
  onChange={handleInputChange}
  inputMode="decimal"
/>
                      {renderError("width")}
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Length (in cm) *</Form.Label>
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
                      <Form.Label>
                        Cover Image{" "}
                        <small>
                        (Preferred Image 114W × 100H (Aspect ratio) and less than 10MB  of  Jpeg,Png type )  {/* (Preffered Image 200×200px and less than 10MB  of  Jpeg,Png type ) */}
                        </small>
                      </Form.Label>
                     <Form.Control
  key={coverInputKey}
  type="file"
  accept={ALLOWED_MIME.join(",")}
  onChange={handleCoverImageChange}
/>
                      {renderError("coverImage")}

                      {formData.coverImage && (
                        <img
                          src={URL.createObjectURL(formData.coverImage)}
                          alt="Cover Preview"
                          style={{
                            marginTop: "10px",
                            width: "150px",
                            height: "auto",
                            borderRadius: "8px",
                          }}
                        />
                      )}
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Additional Images{" "}
                        <small>
                          (Preferred Image 114W × 100H (Aspect ratio) and less than 10MB  of  Jpeg,Png type ) {/* (Preffered Image 200×200px and less than 10MB  of  Jpeg,Png type ) */}
                        </small>
                      </Form.Label>
                     <Form.Control
  key={additionalInputKey}
  type="file"
  multiple
  accept={ALLOWED_MIME.join(",")}
  onChange={handleAdditionalImagesChange}
/>
<div style={{ marginTop: 6, fontSize: "0.9em" }}>
  Selected: {formData.additionalImages.length}
</div>
{errors.additionalImages && (
  <div style={{ color: "red", fontSize: "0.9em" }}>{errors.additionalImages}</div>
)}
{formData.additionalImages.length > 0 && (
  <Button
    variant="secondary"
    size="sm"
    onClick={handleClearAllAdditionalImages}
    style={{ marginTop: 8 }}
  >
    Clear All
  </Button>
)}
                      {renderError("additionalImages")}
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          marginTop: "10px",
                        }}
                      >
                        {formData.additionalImages.map((img, index) => (
                          <div
                            key={`${img.name}-${img.size}-${img.lastModified}-${index}`}
                            style={{
                              position: "relative",
                              marginRight: "10px",
                            }}
                          >
                            <img
                              src={URL.createObjectURL(img)}
                              alt={`Additional ${index}`}
                              style={{
                                width: "120px",
                                height: "auto",
                                borderRadius: "8px",
                              }}
                            />
                            <Button
                              variant="danger"
                              size="sm"
                              style={{ position: "absolute", top: 0, right: 0 }}
                              onClick={() => handleRemoveAdditionalImage(index)}
                            >
                              X
                            </Button>
                          </div>
                        ))}
                      </div>
                    </Form.Group>
                  </Col>
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
  {loading ? "Saving..." : "Add Product"}
</Button>

              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
